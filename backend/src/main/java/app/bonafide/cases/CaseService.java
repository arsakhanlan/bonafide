package app.bonafide.cases;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CaseService {

    private final CaseRepository cases;
    private final Clock clock;

    public CaseService(CaseRepository cases, Clock clock) {
        this.cases = cases;
        this.clock = clock;
    }

    public Case create(String uid, String language, Map<String, Object> demo) {
        Case case_ = Case.newCase(Case.newId(), uid, language, clock.instant(), demo);
        cases.save(case_);
        return case_;
    }

    /** Someone else's case looks like it does not exist (contract: 404, never 403). */
    public Case requireOwned(String uid, String caseId) {
        return cases.find(caseId)
                .filter(c -> c.uid().equals(uid))
                .orElseThrow(NotFound::new);
    }

    public void delete(String uid, String caseId) {
        requireOwned(uid, caseId);
        cases.deleteAll(caseId);
    }

    public static class NotFound extends RuntimeException {
    }
}
