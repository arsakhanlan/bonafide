package app.bonafide.agents;

import app.bonafide.agents.SorterPolicy.Decision;
import app.bonafide.agents.outputs.ReaderOutput;
import app.bonafide.agents.outputs.SorterOutput;
import app.bonafide.cases.Case;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.Stage;
import app.bonafide.documents.DocumentRepository;
import app.bonafide.documents.Masking;
import app.bonafide.documents.PaperService;
import app.bonafide.events.Event;
import app.bonafide.letters.LetterKind;
import app.bonafide.letters.LetterService;
import app.bonafide.money.DisputedPayment;
import app.bonafide.money.FreezeType;
import app.bonafide.money.IndianRupees;
import app.bonafide.money.MoneyInput;
import app.bonafide.money.MoneyResult;
import app.bonafide.money.MoneyTracer;
import app.bonafide.money.Problem;
import app.bonafide.money.StatementLine;
import app.bonafide.trace.TraceWriter;
import com.google.genai.types.Part;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * The fixed first-run pipeline (BUILD_SPEC §10.8): Reader → Sorter → money tracer, with the
 * referral traps. The RuleFinder and the letter loop join later in P2.
 */
@Component
public class FirstRunWorkflow {

    private final PaperService papers;
    private final AgentFactory factory;
    private final AgentRunner runner;
    private final MoneyTracer tracer;
    private final CaseRepository cases;
    private final DocumentRepository documents;
    private final TraceWriter trace;
    private final Clock clock;
    private final LetterService letters;

    public FirstRunWorkflow(
            PaperService papers,
            AgentFactory factory,
            AgentRunner runner,
            MoneyTracer tracer,
            CaseRepository cases,
            DocumentRepository documents,
            TraceWriter trace,
            Clock clock,
            LetterService letters) {
        this.papers = papers;
        this.factory = factory;
        this.runner = runner;
        this.tracer = tracer;
        this.cases = cases;
        this.documents = documents;
        this.trace = trace;
        this.clock = clock;
        this.letters = letters;
    }

    public void run(String caseId, Event event) {
        PaperService.Prepared prepared = papers.prepare(event.payload());
        if (!prepared.parts().isEmpty()) {
            readPapers(caseId, prepared);
        }

        Case caseNow = cases.find(caseId).orElseThrow();
        SorterOutput sorter = runSorter(caseId, caseNow, event);
        Map<String, Object> eligibility = Map.of(
                "status", sorter.status() == null ? "UNCLEAR" : sorter.status(),
                "reasons", sorter.reasons() == null ? List.of() : sorter.reasons());
        Decision decision = SorterPolicy.decide(sorter, caseNow.answersAsked());

        switch (decision.verdict()) {
            case NEEDS_ANSWERS -> askQuestions(caseId, event, sorter, eligibility);
            case REFERRED_DLSA, REFERRED_VICTIM, NEEDS_LAWYER -> refer(caseId, decision, eligibility, sorter);
            case CONTINUE -> continueToMoney(caseId, caseNow, sorter, eligibility, decision);
        }
    }

    private void readPapers(String caseId, PaperService.Prepared prepared) {
        TraceWriter.Handle reading = trace.start(caseId, "READER", "Reading your papers…");
        ReaderOutput output = runner.runJson(
                factory.reader(), caseId, Map.of(), prepared.parts(), ReaderOutput.class);
        reading.done("Read " + prepared.papers().size() + " papers. Found the freeze details.");

        saveDocuments(caseId, prepared, output);
        Map<String, Object> facts = factsOf(output);
        Map<String, Object> fields = new HashMap<>();
        fields.put("facts", facts);
        fields.put("title", titleOf(facts));
        fields.put("personNote", output.personNote());
        // Server-side fields the money tracer needs on later runs (not part of the app contract).
        fields.put("readerFacts", readerFactsOf(output));
        fields.put("statementLines", statementLinesOf(output));
        cases.update(caseId, fields);
    }

    private SorterOutput runSorter(String caseId, Case caseNow, Event event) {
        TraceWriter.Handle sorting = trace.start(caseId, "SORTER", "Checking your case is genuine…");
        Map<String, Object> context = new HashMap<>();
        context.put("facts", caseNow.facts());
        context.put("personNote", caseNow.personNote());
        context.put("answers", mergeAnswers(caseNow, event));
        context.put("questionsAlreadyAsked", caseNow.answersAsked());
        SorterOutput sorter = runner.runJson(
                factory.sorter(), caseId, Map.of(),
                List.of(Part.fromText("Sort this case:\n" + Json.write(context))),
                SorterOutput.class);
        sorting.done(switch (sorter.status()) {
            case "GENUINE" -> "Your case looks genuine";
            case "LENT_ACCOUNT" -> "This needs a lawyer, not letters";
            case "VICTIM" -> "You look like the victim; we'll point you to the helpline";
            default -> "A few quick questions will help";
        });
        return sorter;
    }

    /** The person's answers to earlier questions, if this event carries them. */
    private static List<Map<String, Object>> mergeAnswers(Case caseNow, Event event) {
        List<Map<String, Object>> questions = caseNow.questions();
        @SuppressWarnings("unchecked")
        List<Map<String, String>> answers =
                (List<Map<String, String>>) event.payload().getOrDefault("answers", List.of());
        if (answers.isEmpty()) {
            return questions;
        }
        List<Map<String, Object>> merged = new ArrayList<>();
        for (Map<String, Object> question : questions) {
            Map<String, Object> copy = new HashMap<>(question);
            for (Map<String, String> answer : answers) {
                if (question.get("id").equals(answer.get("questionId"))) {
                    copy.put("answer", answer.get("answer"));
                }
            }
            merged.add(copy);
        }
        return merged;
    }

    private void askQuestions(String caseId, Event event, SorterOutput sorter, Map<String, Object> eligibility) {
        List<Map<String, Object>> questions = new ArrayList<>();
        for (SorterOutput.Question q : sorter.questions() == null
                ? List.<SorterOutput.Question>of() : sorter.questions()) {
            Map<String, Object> question = new HashMap<>();
            question.put("id", q.id() == null ? "" : q.id());
            question.put("text", q.text() == null ? "" : q.text());
            question.put("choices", q.choices() == null ? List.of() : q.choices());
            question.put("answer", null);
            questions.add(question);
        }
        cases.update(caseId, Map.of(
                "questions", questions,
                "eligibility", eligibility,
                "stage", Stage.NEEDS_ANSWERS.name(),
                "nextStep", Map.of("action", "ANSWER_QUESTIONS", "text", "Answer a few quick questions"),
                "answersAsked", true));
        cases.appendHistory(caseId, Map.of("on", todayOf(caseId).toString(), "text", "We asked a few quick questions"));
        trace.start(caseId, "CASE_BOSS", "A few quick questions will finish the check").done("Please answer them when you can.");
    }

    private void refer(String caseId, Decision decision, Map<String, Object> eligibility, SorterOutput sorter) {
        Stage stage = decision.verdict() == SorterPolicy.Verdict.NEEDS_LAWYER
                ? Stage.NEEDS_LAWYER : Stage.REFERRED;
        cases.update(caseId, Map.of(
                "eligibility", eligibility,
                "referral", decision.referral(),
                "stage", stage.name(),
                "nextStep", Map.of("action", "SEE_LEGAL_AID", "text", "This needs a lawyer. Free legal aid may be available to you.")));
        cases.appendHistory(caseId, Map.of("on", todayOf(caseId).toString(), "text", "We cannot write letters for this case"));
        trace.start(caseId, "CASE_BOSS", "We can't write letters for this case. See free legal aid.")
                .done("We pointed you to free legal aid instead.");
    }

    private void continueToMoney(
            String caseId, Case caseNow, SorterOutput sorter, Map<String, Object> eligibility, Decision decision) {
        LocalDate today = todayOf(caseId);
        TraceWriter.Handle maths = trace.start(caseId, "MONEY", "Working out the money…");
        Map<String, Object> raw = cases.findRaw(caseId).orElse(Map.of());
        MoneyResult money = tracer.trace(moneyInputOf(raw, today));
        maths.done(IndianRupees.format(money.disputed()) + " disputed · "
                + IndianRupees.format(money.frozen()) + " frozen · "
                + IndianRupees.format(money.release()) + " should be free");

        List<Map<String, Object>> evidence = evidenceOf(documents.findByCase(caseId), sorter);
        LetterService.DraftResult letter = letters.draft(caseId, LetterKind.L1_BRANCH,
                new LetterService.CaseData(caseNow.facts(), money.disputed(), money.frozen(), money.release(),
                        evidence, caseNow.personNote(), false));

        List<Map<String, Object>> plan = new ArrayList<>();
        plan.add(Map.of("text", "Hand letter 1 to your branch", "who", "YOU", "dueOn", "", "status", "NOW"));
        for (String caution : decision.cautions()) {
            plan.add(Map.of("text", caution, "who", "YOU", "dueOn", "", "status", "LATER"));
        }
        cases.update(caseId, Map.of(
                "eligibility", eligibility,
                "money", moneyOf(money),
                "evidence", evidence,
                "plan", plan,
                "stage", Stage.LETTER_READY.name(),
                "nextStep", Map.of("action", "REVIEW_LETTER", "text", "Check and approve your letter to the branch.",
                        "letterId", letter.letterId())));
        cases.appendHistory(caseId, Map.of("on", today.toString(), "text", "Your letter is ready to check"));
        trace.start(caseId, "CASE_BOSS", "Your letter is ready to check").done("Your letter is ready to check");
    }

    /** The five things officers check (BUILD_SPEC §13), from the documents the person sent. */
    private static List<Map<String, Object>> evidenceOf(List<Map<String, Object>> docs, SorterOutput sorter) {
        List<Map<String, Object>> evidence = new ArrayList<>();
        evidence.add(item("identity", "Who you are", "Aadhaar or PAN", docs, List.of("ID"), null));
        evidence.add(item("sourceOfFunds", "Where the money came from", "Bill and chat for this payment",
                docs, List.of("INVOICE", "CHAT"), null));
        evidence.add(item("business", "Your business or work",
                "Shop registration (Udyam or GST) or a photo of your shop board",
                docs, List.of("OTHER"), "registration|gst|udyam|shop"));
        evidence.add(item("bankingPattern", "Your normal banking",
                "A bank statement of 3 months or more", docs, List.of("STATEMENT"), null));
        boolean haveSource = evidence.get(1).get("status").equals("HAVE");
        boolean genuine = "GENUINE".equals(sorter.status());
        evidence.add(item("linkToOffence", "Why this payment is not fraud",
                "Your proof of work or goods", docs,
                haveSource && genuine ? List.of("INVOICE", "CHAT") : List.of(),
                haveSource && genuine ? null : "unmatched"));
        return evidence;
    }

    private static Map<String, Object> item(String key, String label, String hint,
                                            List<Map<String, Object>> docs, List<String> kinds, String summaryRegex) {
        List<String> docIds = new ArrayList<>();
        boolean have = false;
        for (Map<String, Object> doc : docs) {
            String kind = (String) doc.get("kind");
            if (kinds.contains(kind)) {
                if (summaryRegex != null) {
                    String summary = String.valueOf(doc.getOrDefault("summary", ""));
                    if (!summary.toLowerCase().matches(".*(" + summaryRegex + ").*")) {
                        continue;
                    }
                }
                docIds.add(String.valueOf(doc.getOrDefault("id", "")));
                have = true;
            }
        }
        return Map.of("key", key, "label", label,
                "status", have ? "HAVE" : "MISSING", "docIds", docIds, "hint", hint);
    }

    private void saveDocuments(String caseId, PaperService.Prepared prepared, ReaderOutput output) {
        Map<String, ReaderOutput.Document> read = new HashMap<>();
        for (ReaderOutput.Document doc : output.documents() == null
                ? List.<ReaderOutput.Document>of() : output.documents()) {
            read.put(doc.docId(), doc);
        }
        for (PaperService.Paper paper : prepared.papers()) {
            ReaderOutput.Document doc = read.getOrDefault(paper.docId(), null);
            Map<String, Object> record = new HashMap<>();
            record.put("kind", paper.kind());
            record.put("path", paper.path());
            record.put("mime", paper.mime());
            record.put("fileName", paper.fileName());
            record.put("uploadedAt", com.google.cloud.Timestamp.now());
            record.put("readOk", doc == null || doc.readOk());
            record.put("summary", doc == null ? null : doc.summary());
            record.put("text", Masking.mask(paper.text()));
            record.put("textSource", paper.textSource());
            record.put("guardFlagged", paper.guardFlagged());
            record.put("eventId", null);
            documents.save(caseId, paper.docId(), record);
        }
    }

    private Map<String, Object> factsOf(ReaderOutput output) {
        ReaderOutput.Facts f = output.facts();
        if (f == null) {
            return Map.of();
        }
        Map<String, Object> facts = new HashMap<>();
        facts.put("bank", f.bank());
        facts.put("branch", f.branch());
        facts.put("accountLast4", Masking.accountLast4(f.accountNumberSeen()));
        facts.put("freezeType", f.freezeType());
        facts.put("freezeOn", f.freezeOn());
        facts.put("complaintNo", f.complaintNo());
        facts.put("policeStation", f.policeStation());
        facts.put("officer", f.officer());
        facts.put("state", f.state());
        List<Map<String, Object>> disputed = new ArrayList<>();
        for (ReaderOutput.DisputedPayment p : f.disputedPayments() == null
                ? List.<ReaderOutput.DisputedPayment>of() : f.disputedPayments()) {
            disputed.add(Map.of(
                    "utr", p.utr() == null ? "" : p.utr(),
                    "on", p.on() == null ? "" : p.on(),
                    "amount", decimal(p.amount()).doubleValue(),
                    "from", p.from() == null ? "" : p.from()));
        }
        facts.put("disputedPayments", disputed);
        return facts;
    }

    private String titleOf(Map<String, Object> facts) {
        String bank = (String) facts.getOrDefault("bank", "");
        String last4 = (String) facts.getOrDefault("accountLast4", "");
        String freeze = switch ((String) facts.getOrDefault("freezeType", "")) {
            case "WHOLE_ACCOUNT" -> "whole account frozen";
            case "AMOUNT_HOLD" -> "amount on hold";
            case "DIGITAL_BLOCK" -> "digital banking blocked";
            default -> "account frozen";
        };
        return (bank.isBlank() ? "Your account" : bank) + (last4.isBlank() ? "" : " ••" + last4) + " · " + freeze;
    }

    /** The Reader's strings become BigDecimals and dates only here, in plain code. */
    private static MoneyInput moneyInputOf(Map<String, Object> raw, LocalDate today) {
        Map<String, Object> facts = asMap(raw.get("readerFacts"));
        List<DisputedPayment> disputed = new ArrayList<>();
        for (Map<String, Object> p : asList(facts.get("disputedPayments"))) {
            disputed.add(new DisputedPayment(
                    (String) p.get("utr"), date((String) p.get("on")),
                    decimal((String) p.get("amount")), (String) p.get("from")));
        }
        List<StatementLine> lines = new ArrayList<>();
        for (Map<String, Object> line : asList(raw.get("statementLines"))) {
            lines.add(new StatementLine(
                    date((String) line.get("on")),
                    decimal((String) line.get("amount")),
                    "DEBIT".equalsIgnoreCase((String) line.get("direction"))
                            ? StatementLine.Direction.DEBIT : StatementLine.Direction.CREDIT,
                    (String) line.get("utr"), (String) line.get("party"), decimal((String) line.get("balanceAfter"))));
        }
        return new MoneyInput(
                freezeType((String) facts.get("freezeType")),
                decimal((String) facts.get("heldAmount")),
                decimal((String) facts.get("balanceOnFreeze")),
                disputed,
                lines,
                (String) facts.get("complaintNo"), (String) facts.get("officer"), (String) facts.get("policeStation"),
                Boolean.TRUE.equals(facts.get("digitalBankingBlocked")),
                Boolean.TRUE.equals(facts.get("futureCreditHold")),
                facts.get("layer") instanceof Number n ? n.intValue() : null,
                null, today);
    }

    /** Everything the Reader saw, kept server-side for the money tracer on later runs. */
    private static Map<String, Object> readerFactsOf(ReaderOutput output) {
        ReaderOutput.Facts f = output.facts();
        if (f == null) {
            return Map.of();
        }
        Map<String, Object> facts = new HashMap<>();
        facts.put("bank", f.bank());
        facts.put("branch", f.branch());
        facts.put("accountNumberSeen", f.accountNumberSeen());
        facts.put("freezeType", f.freezeType());
        facts.put("freezeOn", f.freezeOn());
        facts.put("heldAmount", f.heldAmount());
        facts.put("balanceOnFreeze", f.balanceOnFreeze());
        facts.put("complaintNo", f.complaintNo());
        facts.put("policeStation", f.policeStation());
        facts.put("officer", f.officer());
        facts.put("state", f.state());
        facts.put("digitalBankingBlocked", f.digitalBankingBlocked());
        facts.put("futureCreditHold", f.futureCreditHold());
        facts.put("layer", f.layer());
        List<Map<String, Object>> disputed = new ArrayList<>();
        for (ReaderOutput.DisputedPayment p : f.disputedPayments() == null
                ? List.<ReaderOutput.DisputedPayment>of() : f.disputedPayments()) {
            disputed.add(Map.of(
                    "utr", p.utr() == null ? "" : p.utr(),
                    "on", p.on() == null ? "" : p.on(),
                    "amount", p.amount() == null ? "" : p.amount(),
                    "from", p.from() == null ? "" : p.from()));
        }
        facts.put("disputedPayments", disputed);
        return facts;
    }

    private static List<Map<String, Object>> statementLinesOf(ReaderOutput output) {
        List<Map<String, Object>> lines = new ArrayList<>();
        for (ReaderOutput.StatementLine line : output.statementLines() == null
                ? List.<ReaderOutput.StatementLine>of() : output.statementLines()) {
            lines.add(Map.of(
                    "on", line.on() == null ? "" : line.on(),
                    "amount", line.amount() == null ? "" : line.amount(),
                    "direction", line.direction() == null ? "" : line.direction(),
                    "utr", line.utr() == null ? "" : line.utr(),
                    "party", line.party() == null ? "" : line.party(),
                    "balanceAfter", line.balanceAfter() == null ? "" : line.balanceAfter()));
        }
        return lines;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return value == null ? Map.of() : (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> asList(Object value) {
        return value == null ? List.of() : (List<Map<String, Object>>) value;
    }

    private static Map<String, Object> moneyOf(MoneyResult money) {
        if (money == null) {
            return null;
        }
        List<Map<String, Object>> problems = new ArrayList<>();
        for (Problem p : money.problems()) {
            problems.add(Map.of("code", p.code().name(), "text", p.text(), "ruleRef", p.ruleRef()));
        }
        return Map.of(
                "frozen", money.frozen().doubleValue(),
                "disputed", money.disputed().doubleValue(),
                "release", money.release().doubleValue(),
                "problems", problems);
    }

    /** Demo cases live on a pretend date (case.demo.today) so judges can skip ahead. */
    private LocalDate todayOf(String caseId) {
        var case_ = cases.find(caseId).orElse(null);
        if (case_ != null && case_.demo() != null && case_.demo().get("today") instanceof String today) {
            return LocalDate.parse(today);
        }
        return LocalDate.now(clock);
    }

    private static FreezeType freezeType(String value) {
        try {
            return value == null ? FreezeType.UNKNOWN : FreezeType.valueOf(value);
        } catch (IllegalArgumentException e) {
            return FreezeType.UNKNOWN;
        }
    }

    private static BigDecimal decimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(value.replace(",", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static LocalDate date(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
