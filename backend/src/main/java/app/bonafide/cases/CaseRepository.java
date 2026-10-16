package app.bonafide.cases;

import java.util.Map;
import java.util.Optional;

/** Port over Firestore for case documents. */
public interface CaseRepository {

    Optional<Case> find(String caseId);

    void save(Case case_);

    void setBusy(String caseId, boolean busy);

    /** Updates the given top-level fields (stage, facts, money, nextStep, …) in one write. */
    void update(String caseId, Map<String, Object> fields);

    /** Adds one history line without overwriting the others. */
    void appendHistory(String caseId, Map<String, Object> line);

    void deleteAll(String caseId);
}
