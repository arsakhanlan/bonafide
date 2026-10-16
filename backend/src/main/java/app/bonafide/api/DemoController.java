package app.bonafide.api;

import app.bonafide.auth.CurrentUser;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.CaseService;
import app.bonafide.deadlines.TickService;
import app.bonafide.demo.DemoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo/cases")
public class DemoController {

    private final DemoService demo;
    private final CaseService cases;
    private final CaseRepository caseRepository;
    private final TickService tick;

    public DemoController(DemoService demo, CaseService cases, CaseRepository caseRepository, TickService tick) {
        this.demo = demo;
        this.cases = cases;
        this.caseRepository = caseRepository;
        this.tick = tick;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @Valid @RequestBody CreateDemoRequest request) {
        String caseId = demo.create(user.uid(), request.persona()).id();
        return Map.of("caseId", caseId);
    }

    /** Judges' "skip ahead": move the pretend date forward and wake any deadlines it crossed. */
    @PostMapping("/{caseId}/skip")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> skip(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @PathVariable String caseId,
            @Valid @RequestBody SkipRequest request) {
        var case_ = cases.requireOwned(user.uid(), caseId);
        if (case_.demo() == null || !(case_.demo().get("today") instanceof String todayString)) {
            throw new IllegalArgumentException("This case is not a demo case.");
        }
        LocalDate today = LocalDate.parse(todayString).plusDays(request.days());
        Map<String, Object> demoFields = new HashMap<>(case_.demo());
        demoFields.put("today", today.toString());
        caseRepository.update(caseId, Map.<String, Object>of("demo", demoFields));
        int woken = tick.checkCase(caseId, today);
        return Map.of("today", today.toString(), "woken", woken);
    }

    public record CreateDemoRequest(
            @Pattern(regexp = "RAVI|MEERA|ARJUN|SUNIL", message = "unknown persona") String persona) {
    }

    public record SkipRequest(@NotNull @Min(1) @Max(90) Integer days) {
    }
}
