package app.bonafide.cases;

import app.bonafide.documents.FileStore;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CaseService {

    private final CaseRepository cases;
    private final Clock clock;
    private final FileStore files;

    public CaseService(CaseRepository cases, Clock clock, FileStore files) {
        this.cases = cases;
        this.clock = clock;
        this.files = files;
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
        files.deletePrefix("uploads/" + uid + "/" + caseId + "/");
        cases.deleteAll(caseId);
    }

    public static class NotFound extends RuntimeException {
    }
}
