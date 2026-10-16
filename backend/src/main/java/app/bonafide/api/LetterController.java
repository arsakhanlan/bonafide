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
        deadlines.start(caseId, case_.uid(), "letter:" + kind, sentOn, demo);

        String earliest = earliestDueOn(caseId);
        caseRepository.update(caseId, Map.of(
                "stage", "WAITING",
                "nextStep", Map.of("action", "WAIT", "text", "Waiting for the bank to file your grievance.",
                        "dueOn", earliest == null ? "" : earliest)));
        caseRepository.appendHistory(caseId, Map.of("on", sentOn.toString(), "text", "You sent the letter"));
        steps.write(caseId, "CLOCK", "The bank's 7-day clock started: due " + earliest, "INFO");
        return Map.of("status", "SENT");
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
