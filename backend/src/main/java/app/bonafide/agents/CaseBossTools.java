package app.bonafide.agents;

import app.bonafide.cases.Case;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.Stage;
import app.bonafide.deadlines.DeadlineEngine;
import app.bonafide.letters.LetterKind;
import app.bonafide.letters.LetterRepository;
import app.bonafide.letters.LetterService;
import app.bonafide.trace.StepWriter;
import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.ToolContext;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * The CaseBoss's hands (BUILD_SPEC §10.7): every tool is bound to the case in the session
 * state, and every clock change goes through the DeadlineEngine, never the LLM.
 */
@Component
public class CaseBossTools {

    private final CaseRepository cases;
    private final LetterRepository letters;
    private final DeadlineEngine deadlines;
    private final LetterService letterService;
    private final StepWriter steps;
    private final Clock clock;

    public CaseBossTools(
            CaseRepository cases,
            LetterRepository letters,
            DeadlineEngine deadlines,
            LetterService letterService,
            StepWriter steps,
            Clock clock) {
        this.cases = cases;
        this.letters = letters;
        this.deadlines = deadlines;
        this.letterService = letterService;
        this.steps = steps;
        this.clock = clock;
    }

    public Map<String, Object> getCase(ToolContext toolContext) {
        String caseId = caseId(toolContext);
        Case case_ = cases.find(caseId).orElseThrow();
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("stage", case_.stage().name());
        view.put("facts", case_.facts());
        view.put("money", case_.money());
        view.put("letters", letters.findByCase(caseId).stream()
                .map(l -> Map.of("kind", l.get("kind"), "status", l.get("status"),
                        "title", l.get("title"), "reminder", Boolean.TRUE.equals(l.get("reminder"))))
                .toList());
        view.put("deadlines", caseDeadlines(caseId));
        List<Map<String, Object>> history = case_.history();
        view.put("history", history.subList(Math.max(0, history.size() - 10), history.size()));
        view.put("today", todayOf(case_).toString());
        return view;
    }

    public Map<String, Object> recordMilestone(
            @Schema(name = "type", description = "One of BANK_FILED, OFFICER_NOTICE, OFFICER_REFUSED, "
                    + "OFFICER_SILENT, HOLD_LIMITED, FULLY_RELEASED, REFUND_TO_VICTIM_NOTICE, DIGITAL_BLOCKED, OTHER")
            String type,
            @Schema(name = "on", description = "The date the milestone happened, YYYY-MM-DD") String on,
            @Schema(name = "note", description = "One short plain sentence for the history") String note,
            ToolContext toolContext) {
        String caseId = caseId(toolContext);
        LocalDate milestoneOn = on == null ? todayOf(caseId) : LocalDate.parse(on);
        if (!"OTHER".equals(type)) {
            deadlines.apply(caseId, type, milestoneOn);
        }
        cases.appendHistory(caseId, Map.of("on", milestoneOn.toString(), "text", note == null ? type : note));
        steps.write(caseId, "CLOCK", "Clocks updated: " + type, "INFO");
        return Map.of("recorded", type);
    }

    public Map<String, Object> draftLetter(
            @Schema(name = "kind", description = "One of L1_BRANCH, L2_OFFICER, L3_REVIEW, L3_DISTRICT, "
                    + "L4_BACKSTOP, L5_LAWYER_NOTES")
            String kind,
            @Schema(name = "reason", description = "One short plain reason this letter is needed") String reason,
            @Schema(name = "reminder", description = "true when the bank missed its 7 days and this is a reminder")
            boolean reminder,
            ToolContext toolContext) {
        String caseId = caseId(toolContext);
        Case case_ = cases.find(caseId).orElseThrow();
        Map<String, Object> money = case_.money() == null ? Map.of() : case_.money();
        LetterService.CaseData data = new LetterService.CaseData(
                case_.facts(),
                number(money.get("disputed")), number(money.get("frozen")), number(money.get("release")),
                case_.evidence(), case_.personNote(), reminder);
        LetterService.DraftResult result = letterService.draft(caseId, LetterKind.valueOf(kind), data);
        cases.update(caseId, Map.of(
                "stage", Stage.LETTER_READY.name(),
                "nextStep", Map.of("action", "REVIEW_LETTER", "text",
                        "Check and approve your next letter.", "letterId", result.letterId())));
        cases.appendHistory(caseId, Map.of("on", todayOf(caseId).toString(),
                "text", reason == null || reason.isBlank() ? "A new letter is ready" : reason));
        return Map.of("letterId", result.letterId());
    }

    public Map<String, Object> setStage(
            @Schema(name = "stage", description = "One of NEW, NEEDS_ANSWERS, LETTER_READY, WAITING, "
                    + "PARTLY_RELEASED, RESOLVED, REFERRED, NEEDS_LAWYER, FAILED")
            String stage,
            @Schema(name = "nextStepText", description = "The plain-words text for the one big button") String nextStepText,
            ToolContext toolContext) {
        String caseId = caseId(toolContext);
        Stage newStage = Stage.valueOf(stage);
        Map<String, Object> nextStep = Map.of(
                "action", newStage == Stage.LETTER_READY ? "REVIEW_LETTER"
                        : newStage == Stage.REFERRED || newStage == Stage.NEEDS_LAWYER ? "SEE_LEGAL_AID"
                        : newStage == Stage.WAITING ? "WAIT"
                        : newStage == Stage.RESOLVED ? "NONE" : "UPLOAD_PAPERS",
                "text", nextStepText == null ? "" : nextStepText);
        cases.update(caseId, Map.of("stage", newStage.name(), "nextStep", nextStep));
        return Map.of("stage", newStage.name());
    }

    public Map<String, Object> refer(
            @Schema(name = "to", description = "DLSA or LAWYER") String to,
            @Schema(name = "reason", description = "One short plain reason") String reason,
            ToolContext toolContext) {
        String caseId = caseId(toolContext);
        boolean lawyer = "LAWYER".equals(to);
        cases.update(caseId, Map.of(
                "referral", SorterPolicy.DLSA_REFERRAL,
                "stage", lawyer ? Stage.NEEDS_LAWYER.name() : Stage.REFERRED.name(),
                "nextStep", Map.of("action", "SEE_LEGAL_AID", "text",
                        "This needs a lawyer. Free legal aid may be available to you.")));
        cases.appendHistory(caseId, Map.of("on", todayOf(caseId).toString(), "text",
                reason == null || reason.isBlank() ? "We referred you to free legal aid" : reason));
        return Map.of("referred", to);
    }

    public Map<String, Object> addHistory(
            @Schema(name = "text", description = "One short plain sentence") String text,
            ToolContext toolContext) {
        String caseId = caseId(toolContext);
        cases.appendHistory(caseId, Map.of("on", todayOf(caseId).toString(), "text", text));
        return Map.of("added", true);
    }

    private List<Map<String, Object>> caseDeadlines(String caseId) {
        List<Map<String, Object>> view = new ArrayList<>();
        for (var deadline : deadlines.all(caseId)) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("clock", deadline.clock());
            entry.put("who", deadline.who());
            entry.put("status", deadline.status().name());
            entry.put("dueOn", deadline.dueOn().toString());
            view.add(entry);
        }
        return view;
    }

    private LocalDate todayOf(String caseId) {
        return todayOf(cases.find(caseId).orElseThrow());
    }

    private LocalDate todayOf(Case case_) {
        if (case_.demo() != null && case_.demo().get("today") instanceof String today) {
            return LocalDate.parse(today);
        }
        return LocalDate.now(clock);
    }

    private static String caseId(ToolContext toolContext) {
        return (String) toolContext.state().get("caseId");
    }

    private static BigDecimal number(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value instanceof Number n ? BigDecimal.valueOf(n.doubleValue()) : new BigDecimal(value.toString());
    }
}
