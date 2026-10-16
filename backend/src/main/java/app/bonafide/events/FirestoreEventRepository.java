package app.bonafide.events;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Filter;
import com.google.cloud.firestore.Firestore;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class FirestoreEventRepository implements EventRepository {

    private final Firestore firestore;

    public FirestoreEventRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public CreateResult createPendingIfFree(String caseId, String uid, Event event) {
        var caseRef = firestore.collection("cases").document(caseId);
        var eventRef = caseRef.collection("events").document(event.id());
        try {
            return firestore.runTransaction(tx -> {
                var caseSnapshot = tx.get(caseRef).get();
                if (!caseSnapshot.exists() || !uid.equals(caseSnapshot.get("uid"))) {
                    return CreateResult.NOT_FOUND;
                }
                if (Boolean.TRUE.equals(caseSnapshot.get("busy"))) {
                    return CreateResult.BUSY;
                }
                tx.update(caseRef, "busy", true, "updatedAt", FieldValue.serverTimestamp());
                tx.create(eventRef, toMap(event));
                return CreateResult.CREATED;
            }).get();
        } catch (Exception e) {
            if (String.valueOf(e.getMessage()).contains("ALREADY_EXISTS")) {
                return CreateResult.BUSY; // idempotent event ids: already woken, skip quietly
            }
            throw new IllegalStateException("Creating event on " + caseId + " failed", e);
        }
    }

    @Override
    public Optional<Event> claim(String caseId, String eventId) {
        var eventRef = firestore.collection("cases").document(caseId).collection("events").document(eventId);
        try {
            Event claimed = firestore.runTransaction(tx -> {
                var snapshot = tx.get(eventRef).get();
                if (!snapshot.exists() || !EventStatus.PENDING.name().equals(snapshot.get("status"))) {
                    return null;
                }
                tx.update(eventRef,
                        "status", EventStatus.RUNNING.name(),
                        "attempts", FieldValue.increment(1),
                        "startedAt", FieldValue.serverTimestamp());
                return fromMap(snapshot.getId(), snapshot.getData());
            }).get();
            return Optional.ofNullable(claimed);
        } catch (Exception e) {
            throw new IllegalStateException("Claiming event " + eventId + " failed", e);
        }
    }

    @Override
    public void finish(String caseId, String eventId, EventStatus status, String error) {
        update(caseId, eventId, Map.of(
                "status", status.name(),
                "error", error,
                "finishedAt", FieldValue.serverTimestamp()));
    }

    @Override
    public List<Event> sweepStale(java.time.Instant runningCutoff, java.time.Instant pendingCutoff) {
        List<Event> stale = new ArrayList<>();
        try {
            for (var snapshot : firestore.collectionGroup("events")
                    .where(Filter.greaterThanOrEqualTo("createdAt",
                            Timestamp.of(java.util.Date.from(pendingCutoff.minusSeconds(86400)))))
                    .get().get().getDocuments()) {
                String status = (String) snapshot.get("status");
                Timestamp started = (Timestamp) snapshot.get("startedAt");
                Timestamp created = (Timestamp) snapshot.get("createdAt");
                boolean staleRunning = "RUNNING".equals(status) && started != null
                        && started.toDate().toInstant().isBefore(runningCutoff);
                boolean stalePending = "PENDING".equals(status) && created != null
                        && created.toDate().toInstant().isBefore(pendingCutoff);
                if (staleRunning || stalePending) {
                    String caseId = snapshot.getReference().getParent().getParent().getId();
                    Event event = fromMap(snapshot.getId(), snapshot.getData());
                    stale.add(new Event(event.id(), caseId, event.type(), event.payload(), event.status(),
                            event.attempts(), event.error(), event.createdAt(), event.startedAt(), event.finishedAt()));
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("The stale-event sweep failed", e);
        }
        return stale;
    }

    @Override
    public void requeue(String caseId, String eventId) {
        update(caseId, eventId, Map.of("status", EventStatus.PENDING.name()));
    }

    private void update(String caseId, String eventId, Map<String, Object> fields) {
        try {
            firestore.collection("cases").document(caseId)
                    .collection("events").document(eventId).update(fields).get();
        } catch (Exception e) {
            throw new IllegalStateException("Updating event " + eventId + " failed", e);
        }
    }

    private static Map<String, Object> toMap(Event e) {
        Map<String, Object> map = new HashMap<>();
        map.put("type", e.type().name());
        map.put("payload", e.payload() == null ? Map.of() : e.payload());
        map.put("status", e.status().name());
        map.put("attempts", e.attempts());
        map.put("error", e.error());
        map.put("createdAt", Timestamp.of(java.util.Date.from(e.createdAt())));
        map.put("startedAt", null);
        map.put("finishedAt", null);
        return map;
    }

    private static Event fromMap(String id, Map<String, Object> map) {
        return new Event(
                id,
                null, // caseId is not stored on the event; the caller knows it
                EventType.valueOf((String) map.get("type")),
                map.containsKey("payload") ? castPayload(map.get("payload")) : Map.of(),
                EventStatus.valueOf((String) map.get("status")),
                ((Number) map.getOrDefault("attempts", 0)).intValue(),
                (String) map.get("error"),
                timestampToInstant(map.get("createdAt")),
                timestampToInstant(map.get("startedAt")),
                timestampToInstant(map.get("finishedAt")));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castPayload(Object payload) {
        return payload == null ? Map.of() : (Map<String, Object>) payload;
    }

    private static Instant timestampToInstant(Object value) {
        return value instanceof Timestamp t ? Instant.ofEpochSecond(t.getSeconds(), t.getNanos()) : null;
    }
}
