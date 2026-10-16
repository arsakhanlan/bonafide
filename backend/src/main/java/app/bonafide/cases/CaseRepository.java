package app.bonafide.cases;

import java.util.Map;
import java.util.Optional;

/** Port over Firestore for case documents. */
public interface CaseRepository {

    Optional<Case> find(String caseId);

    void save(Case case_);

    void setBusy(String caseId, boolean busy);

    void updateStageNextStep(String caseId, Stage stage, Map<String, Object> nextStep);

    void deleteAll(String caseId);
}
