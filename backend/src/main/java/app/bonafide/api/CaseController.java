package app.bonafide.api;

import app.bonafide.auth.CurrentUser;
import app.bonafide.cases.CaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService cases;

    public CaseController(CaseService cases) {
        this.cases = cases;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @Valid @RequestBody CreateCaseRequest request) {
        String caseId = cases.create(user.uid(), request.language(), null).id();
        return Map.of("caseId", caseId);
    }

    @DeleteMapping("/{caseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @PathVariable String caseId) {
        cases.delete(user.uid(), caseId);
    }

    public record CreateCaseRequest(
            @Pattern(regexp = "en|hi", message = "language must be en or hi") String language) {
    }
}
