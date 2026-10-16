package app.bonafide.events;

import java.util.List;
import java.util.Optional;

/** Port over Firestore for events, including the busy-check transaction (BUILD_SPEC §8, §9). */
public interface EventRepository {

    enum CreateResult {
        CREATED,
        BUSY,
        NOT_FOUND
    }

    /** In one transaction: 404 if not owned, BUSY if busy, else busy=true and the event PENDING. */
    CreateResult createPendingIfFree(String caseId, String uid, Event event);

    /** PENDING → RUNNING with attempts+1; empty if the event is missing or already claimed. */
    Optional<Event> claim(String caseId, String eventId);

    void finish(String caseId, String eventId, EventStatus status, String error);

    /** RUNNING → PENDING so the tick can retry a stuck or failed-but-retryable event. */
    void requeue(String caseId, String eventId);

    /** RUNNING older than runningCutoff, or PENDING older than pendingCutoff (for the tick). */
    List<Event> sweepStale(java.time.Instant runningCutoff, java.time.Instant pendingCutoff);
}
