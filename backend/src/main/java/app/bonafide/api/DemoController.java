package app.bonafide.api;

import app.bonafide.auth.CurrentUser;
import app.bonafide.demo.DemoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.util.Map;
import org.springframework.http.HttpStatus;
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

    public DemoController(DemoService demo) {
        this.demo = demo;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @Valid @RequestBody CreateDemoRequest request) {
        String caseId = demo.create(user.uid(), request.persona()).id();
        return Map.of("caseId", caseId);
    }

    public record CreateDemoRequest(
            @Pattern(regexp = "RAVI|MEERA|ARJUN|SUNIL", message = "unknown persona") String persona) {
    }
}
