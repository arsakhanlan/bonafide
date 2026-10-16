package app.bonafide.agents;

import app.bonafide.agents.outputs.ReaderOutput;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.Stage;
import app.bonafide.documents.DocumentRepository;
import app.bonafide.documents.Masking;
import app.bonafide.documents.PaperService;
import app.bonafide.events.Event;
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
 * The fixed first-run pipeline (BUILD_SPEC §10.8): Reader → money tracer → save facts and money.
 * The Sorter, RuleFinder and the letter loop join in later phases; until then the case still
 * lands at LETTER_READY with the money maths done.
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

    public FirstRunWorkflow(
            PaperService papers,
            AgentFactory factory,
            AgentRunner runner,
            MoneyTracer tracer,
            CaseRepository cases,
            DocumentRepository documents,
            TraceWriter trace,
            Clock clock) {
        this.papers = papers;
        this.factory = factory;
        this.runner = runner;
        this.tracer = tracer;
        this.cases = cases;
        this.documents = documents;
        this.trace = trace;
        this.clock = clock;
    }

    public void run(String caseId, Event event) {
        PaperService.Prepared prepared = papers.prepare(event.payload());
        if (prepared.parts().isEmpty()) {
            throw new IllegalArgumentException("No papers to read");
        }

        TraceWriter.Handle reading = trace.start(caseId, "READER", "Reading your papers…");
        ReaderOutput output = runner.runJson(
                factory.reader(), caseId, Map.of(), prepared.parts(), ReaderOutput.class);
        reading.done("Read " + prepared.papers().size() + " papers. Found the freeze details.");

        saveDocuments(caseId, prepared, output);
        Map<String, Object> facts = factsOf(output);
        cases.update(caseId, Map.of("facts", facts, "title", titleOf(facts)));

        LocalDate today = todayOf(caseId);
        TraceWriter.Handle maths = trace.start(caseId, "MONEY", "Working out the money…");
        MoneyResult money = tracer.trace(moneyInputOf(output, today));
        maths.done(IndianRupees.format(money.disputed()) + " disputed · "
                + IndianRupees.format(money.frozen()) + " frozen · "
                + IndianRupees.format(money.release()) + " should be free");

        cases.update(caseId, Map.of(
                "money", moneyOf(money),
                "stage", Stage.LETTER_READY.name(),
                "nextStep", Map.of("action", "REVIEW_LETTER", "text", "Check and approve your letter to the branch.")));
        cases.appendHistory(caseId, Map.of("on", today.toString(), "text", "Your money maths is ready"));
        trace.start(caseId, "CASE_BOSS", "Your money maths is ready").done("Your money maths is ready");
    }

    private void saveDocuments(String caseId, PaperService.Prepared prepared, ReaderOutput output) {
        Map<String, ReaderOutput.Document> read = new HashMap<>();
        for (ReaderOutput.Document doc : output.documents() == null ? List.<ReaderOutput.Document>of() : output.documents()) {
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

    private MoneyInput moneyInputOf(ReaderOutput output, LocalDate today) {
        ReaderOutput.Facts f = output.facts();
        if (f == null) {
            return null;
        }
        List<DisputedPayment> disputed = new ArrayList<>();
        for (ReaderOutput.DisputedPayment p : f.disputedPayments() == null
                ? List.<ReaderOutput.DisputedPayment>of() : f.disputedPayments()) {
            disputed.add(new DisputedPayment(p.utr(), date(p.on()), decimal(p.amount()), p.from()));
        }
        List<StatementLine> lines = new ArrayList<>();
        for (ReaderOutput.StatementLine line : output.statementLines() == null
                ? List.<ReaderOutput.StatementLine>of() : output.statementLines()) {
            lines.add(new StatementLine(
                    date(line.on()),
                    decimal(line.amount()),
                    "DEBIT".equalsIgnoreCase(line.direction())
                            ? StatementLine.Direction.DEBIT : StatementLine.Direction.CREDIT,
                    line.utr(), line.party(), decimal(line.balanceAfter())));
        }
        return new MoneyInput(
                freezeType(f.freezeType()),
                decimal(f.heldAmount()),
                decimal(f.balanceOnFreeze()),
                disputed,
                lines,
                f.complaintNo(), f.officer(), f.policeStation(),
                f.digitalBankingBlocked(), f.futureCreditHold(), f.layer(),
                null, today);
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
