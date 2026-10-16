package app.bonafide.cases;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

/** Explicit record ↔ map mapping, because Firestore's automatic record mapping is unreliable. */
@Repository
@Profile("!test")
public class FirestoreCaseRepository implements CaseRepository {

    private final Firestore firestore;

    public FirestoreCaseRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public Optional<Case> find(String caseId) {
        try {
            var snapshot = firestore.collection("cases").document(caseId).get().get();
            if (!snapshot.exists()) {
                return Optional.empty();
            }
            return Optional.of(fromMap(snapshot.getId(), snapshot.getData()));
        } catch (Exception e) {
            throw new IllegalStateException("Reading case " + caseId + " failed", e);
        }
    }

    @Override
    public Optional<Map<String, Object>> findRaw(String caseId) {
        try {
            var snapshot = firestore.collection("cases").document(caseId).get().get();
            return snapshot.exists() ? Optional.of(snapshot.getData()) : Optional.empty();
        } catch (Exception e) {
            throw new IllegalStateException("Reading raw case " + caseId + " failed", e);
        }
    }

    @Override
    public void save(Case case_) {
        try {
            firestore.collection("cases").document(case_.id()).set(toMap(case_)).get();
        } catch (Exception e) {
            throw new IllegalStateException("Saving case " + case_.id() + " failed", e);
        }
    }

    @Override
    public void setBusy(String caseId, boolean busy) {
        try {
            firestore.collection("cases").document(caseId).update("busy", busy).get();
        } catch (Exception e) {
            throw new IllegalStateException("Setting busy on " + caseId + " failed", e);
        }
    }

    @Override
    public void update(String caseId, Map<String, Object> fields) {
        try {
            firestore.collection("cases").document(caseId).update(fields).get();
        } catch (Exception e) {
            throw new IllegalStateException("Updating case " + caseId + " failed", e);
        }
    }

    @Override
    public void appendHistory(String caseId, Map<String, Object> line) {
        try {
            firestore.collection("cases").document(caseId)
                    .update("history", com.google.cloud.firestore.FieldValue.arrayUnion(line)).get();
        } catch (Exception e) {
            throw new IllegalStateException("Adding history on " + caseId + " failed", e);
        }
    }

    @Override
    public void deleteAll(String caseId) {
        try {
            firestore.recursiveDelete(firestore.collection("cases").document(caseId)).get();
        } catch (Exception e) {
            throw new IllegalStateException("Deleting case " + caseId + " failed", e);
        }
    }

    private static Map<String, Object> toMap(Case c) {
        Map<String, Object> map = new HashMap<>();
        map.put("uid", c.uid());
        map.put("language", c.language());
        map.put("stage", c.stage().name());
        map.put("busy", c.busy());
        map.put("title", c.title());
        map.put("createdAt", Timestamp.of(java.util.Date.from(c.createdAt())));
        map.put("updatedAt", Timestamp.of(java.util.Date.from(c.updatedAt())));
        map.put("facts", c.facts());
        map.put("questions", c.questions());
        map.put("eligibility", c.eligibility());
        map.put("money", c.money());
        map.put("evidence", c.evidence());
        map.put("plan", c.plan());
        map.put("nextStep", c.nextStep());
        map.put("referral", c.referral());
        map.put("history", c.history());
        map.put("demo", c.demo());
        map.put("personNote", c.personNote());
        map.put("answersAsked", c.answersAsked());
        return map;
    }

    private static Case fromMap(String id, Map<String, Object> map) {
        return new Case(
                id,
                (String) map.get("uid"),
                (String) map.get("language"),
                Stage.valueOf((String) map.get("stage")),
                Boolean.TRUE.equals(map.get("busy")),
                (String) map.get("title"),
                timestampToInstant(map.get("createdAt")),
                timestampToInstant(map.get("updatedAt")),
                asMap(map.get("facts")),
                asList(map.get("questions")),
                asMap(map.get("eligibility")),
                asMap(map.get("money")),
                asList(map.get("evidence")),
                asList(map.get("plan")),
                asMap(map.get("nextStep")),
                asMap(map.get("referral")),
                asList(map.get("history")),
                asMap(map.get("demo")),
                (String) map.get("personNote"),
                Boolean.TRUE.equals(map.get("answersAsked")));
    }

    private static Instant timestampToInstant(Object value) {
        return value instanceof Timestamp t ? Instant.ofEpochSecond(t.getSeconds(), t.getNanos()) : null;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return value == null ? Map.of() : (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private static java.util.List<Map<String, Object>> asList(Object value) {
        return value == null ? java.util.List.of() : (java.util.List<Map<String, Object>>) value;
    }
}
