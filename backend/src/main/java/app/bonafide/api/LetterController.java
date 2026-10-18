package app.bonafide.api;

import app.bonafide.auth.CurrentUser;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.CaseService;
import app.bonafide.deadlines.DeadlineEngine;
import app.bonafide.letters.LetterRepository;
import app.bonafide.trace.StepWriter;
import com.google.cloud.Timestamp;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.Clock;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Approve → sent → the clocks start (BUILD_SPEC §8). */
@RestController
@RequestMapping("/api/cases/{caseId}/letters/{letterId}")
public class LetterController {

    private final CaseService cases;
    private final LetterRepository letters;
    private final CaseRepository caseRepository;
    private final DeadlineEngine deadlines;
    private final StepWriter steps;
    private final Clock clock;

    public LetterController(
            CaseService cases,
            LetterRepository letters,
            CaseRepository caseRepository,
            DeadlineEngine deadlines,
            StepWriter steps,
            Clock clock) {
        this.cases = cases;
        this.letters = letters;
        this.caseRepository = caseRepository;
        this.deadlines = deadlines;
        this.steps = steps;
        this.clock = clock;
    }

    @PostMapping("/approve")
    public Map<String, Object> approve(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @PathVariable String caseId,
            @PathVariable String letterId,
            @Valid @RequestBody(required = false) ApproveRequest request) {
        cases.requireOwned(user.uid(), caseId);
        Map<String, Object> letter = letters.find(caseId, letterId)
                .filter(l -> "DRAFT".equals(l.get("status")))
                .orElseThrow(CaseService.NotFound::new);

        Map<String, Object> fields = new HashMap<>();
        fields.put("status", "APPROVED");
        fields.put("approvedAt", Timestamp.now());
        if (request != null && request.body() != null && !request.body().isBlank()) {
            if (request.body().contains("{{")) {
                throw new PlaceholdersLeft();
            }
            fields.put("body", request.body());
            fields.put("editedByPerson", true);
        } else if (letter.get("body") != null && String.valueOf(letter.get("body")).contains("{{")) {
            // Approving without edits still requires the gaps to be filled.
            throw new PlaceholdersLeft();
        }
        letters.update(caseId, letterId, fields);

        String nextStepText = "Send the letter yourself: print it, email it, WhatsApp it, or hand it in at your branch.";
        caseRepository.update(caseId, Map.of(
                "nextStep", Map.of("action", "SEND_LETTER", "text", nextStepText, "letterId", letterId)));
        steps.write(caseId, "SYSTEM", "Letter approved. Now send it yourself.", "INFO");
        return Map.of("status", "APPROVED");
    }

    @PostMapping("/sent")
    public Map<String, Object> sent(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @PathVariable String caseId,
            @PathVariable String letterId,
            @Valid @RequestBody SentRequest request) {
        var case_ = cases.requireOwned(user.uid(), caseId);
        Map<String, Object> letter = letters.find(caseId, letterId)
                .filter(l -> "APPROVED".equals(l.get("status")))
                .orElseThrow(CaseService.NotFound::new);

        LocalDate sentOn = request.sentOn() == null ? LocalDate.now(clock) : LocalDate.parse(request.sentOn());
        letters.update(caseId, letterId, Map.of(
                "status", "SENT", "sentOn", sentOn.toString(), "sentHow", request.how()));

        boolean demo = case_.demo() != null;
        String kind = (String) letter.get("kind");
        var started = deadlines.start(caseId, case_.uid(), "letter:" + kind, sentOn, demo);
        String audience = audienceOf(kind);

        if ("L5_LAWYER_NOTES".equals(kind)) {
            caseRepository.update(caseId, Map.of(
                    "stage", "NEEDS_LAWYER",
                    "nextStep", Map.of("action", "SEE_LEGAL_AID",
                            "text", "Take these notes to a lawyer or free legal aid. "
                                    + "This is a court step; Bonafide cannot file a petition.")));
            caseRepository.appendHistory(caseId, Map.of("on", sentOn.toString(),
                    "text", "You gave the notes to your lawyer"));
            steps.write(caseId, "SYSTEM",
                    "Notes handed to a lawyer. Next step: court, with a lawyer.", "INFO");
            return Map.of("status", "SENT");
        }

        String dueOn = started.stream()
                .map(d -> d.dueOn())
                .min(LocalDate::compareTo)
                .map(LocalDate::toString)
                .orElseGet(() -> earliestDueOn(caseId));

        caseRepository.update(caseId, Map.of(
                "stage", "WAITING",
                "nextStep", Map.of("action", "WAIT", "text", waitingText(kind),
                        "dueOn", dueOn == null ? "" : dueOn)));
        caseRepository.appendHistory(caseId, Map.of("on", sentOn.toString(),
                "text", "You sent the letter to " + audience));
        steps.write(caseId, "CLOCK", started.isEmpty()
                ? "Letter sent to " + audience + ". We will update the next step here."
                : "Letter sent to " + audience + ". Deadline: " + dueOn, "INFO");
        return Map.of("status", "SENT");
    }

    private static String audienceOf(String kind) {
        if (kind == null) {
            return "the bank";
        }
        return switch (kind) {
            case "L2_OFFICER" -> "the police";
            case "L3_REVIEW", "L3_DISTRICT" -> "the District Grievance Officer";
            case "L5_LAWYER_NOTES" -> "your lawyer";
            default -> "the bank";
        };
    }

    private static String waitingText(String kind) {
        if (kind == null) {
            return "Waiting for the bank to file your grievance.";
        }
        return switch (kind) {
            case "L2_OFFICER" -> "Waiting for the police to respond.";
            case "L3_REVIEW", "L3_DISTRICT" -> "Waiting for the District Grievance Officer to decide.";
            case "L4_BACKSTOP" -> "Waiting for the bank to remove the hold.";
            default -> "Waiting for the bank to file your grievance.";
        };
    }

    private String earliestDueOn(String caseId) {
        return deadlines.earliestPendingDueOn(caseId)
                .map(LocalDate::toString)
                .orElse(null);
    }

    public record ApproveRequest(String body) {
    }

    public record SentRequest(
            @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "sentOn must be YYYY-MM-DD") String sentOn,
            @NotBlank @Pattern(regexp = "BRANCH|EMAIL|WHATSAPP|POST", message = "how must be BRANCH, EMAIL, WHATSAPP or POST")
            String how) {
    }

    public static class PlaceholdersLeft extends RuntimeException {
    }
}
