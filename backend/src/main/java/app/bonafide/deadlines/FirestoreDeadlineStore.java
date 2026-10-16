package app.bonafide.deadlines;

import com.google.cloud.firestore.Filter;
import com.google.cloud.firestore.Firestore;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class FirestoreDeadlineStore implements DeadlineStore {

    private final Firestore firestore;

    public FirestoreDeadlineStore(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public void put(String caseId, Deadline deadline) {
        try {
            firestore.collection("cases").document(caseId)
                    .collection("deadlines").document(deadline.clock()).set(toMap(deadline)).get();
        } catch (Exception e) {
            throw new IllegalStateException("Saving deadline " + deadline.clock() + " failed", e);
        }
    }

    @Override
    public List<Deadline> findAll(String caseId) {
        List<Deadline> deadlines = new ArrayList<>();
        try {
            for (var snapshot : firestore.collection("cases").document(caseId)
                    .collection("deadlines").get().get().getDocuments()) {
                deadlines.add(fromMap(snapshot.getData()));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Reading deadlines on " + caseId + " failed", e);
        }
        return deadlines;
    }

    @Override
    public void markStatus(String caseId, String clock, Deadline.Status status) {
        try {
            firestore.collection("cases").document(caseId)
                    .collection("deadlines").document(clock).update("status", status.name()).get();
        } catch (Exception e) {
            // Missing deadline documents are fine: a clock that never started cannot be met.
        }
    }

    /** The tick's collection-group sweep: PENDING deadlines whose due day has ended. */
    public List<Deadline> findMissed(LocalDate today) {
        List<Deadline> deadlines = new ArrayList<>();
        try {
            for (var snapshot : firestore.collectionGroup("deadlines")
                    .where(Filter.equalTo("status", "PENDING"))
                    .where(Filter.lessThan("dueOn", today.toString()))
                    .get().get().getDocuments()) {
                deadlines.add(fromMap(snapshot.getData()));
            }
        } catch (Exception e) {
            throw new IllegalStateException("The missed-deadline sweep failed", e);
        }
        return deadlines;
    }

    private static Map<String, Object> toMap(Deadline d) {
        Map<String, Object> map = new HashMap<>();
        map.put("clock", d.clock());
        map.put("who", d.who());
        map.put("title", d.title());
        map.put("startOn", d.startOn().toString());
        map.put("dueOn", d.dueOn().toString());
        map.put("status", d.status().name());
        map.put("ruleRef", d.ruleRef());
        map.put("demo", d.demo());
        map.put("caseId", d.caseId());
        map.put("uid", d.uid());
        return map;
    }

    private static Deadline fromMap(Map<String, Object> map) {
        return new Deadline(
                (String) map.get("clock"),
                (String) map.get("who"),
                (String) map.get("title"),
                LocalDate.parse((String) map.get("startOn")),
                LocalDate.parse((String) map.get("dueOn")),
                Deadline.Status.valueOf((String) map.get("status")),
                (String) map.get("ruleRef"),
                Boolean.TRUE.equals(map.get("demo")),
                (String) map.get("caseId"),
                (String) map.get("uid"));
    }
}
