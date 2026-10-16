package app.bonafide.deadlines;

import app.bonafide.deadlines.Deadline.Status;
import app.bonafide.events.Event;
import app.bonafide.events.EventDispatcher;
import app.bonafide.events.EventRepository;
import app.bonafide.events.EventType;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * The hourly tick (BUILD_SPEC §9): every missed deadline becomes a DEADLINE_PASSED event
 * with an idempotent id, and stuck events go back for retry. Demo deadlines only fire
 * through checkCase, never the real tick.
 */
@Service
public class TickService {

    private static final Logger log = LoggerFactory.getLogger(TickService.class);

    private final DeadlineStore deadlines;
    private final EventRepository events;
    private final EventDispatcher dispatcher;
    private final Clock clock;

    public TickService(DeadlineStore deadlines, EventRepository events, EventDispatcher dispatcher, Clock clock) {
        this.deadlines = deadlines;
        this.events = events;
        this.dispatcher = dispatcher;
        this.clock = clock;
    }

    public int tick(LocalDate today, boolean includeDemo) {
        int woken = 0;
        for (Deadline missed : missedSweep(today)) {
            if (!includeDemo && missed.demo()) {
                continue;
            }
            if (wakeDeadline(missed, today)) {
                woken++;
            }
        }
        requeueStuck();
        return woken;
    }

    /** Demo skip: one case only, demo deadlines included, with the pretend today. */
    public int checkCase(String caseId, LocalDate today) {
        int woken = 0;
        for (Deadline missed : deadlines.findAll(caseId)) {
            if (missed.status() == Status.PENDING && today.isAfter(missed.dueOn()) && wakeDeadline(missed, today)) {
                woken++;
            }
        }
        return woken;
    }

    private boolean wakeDeadline(Deadline missed, LocalDate today) {
        Event event = new Event(
                "dl-" + missed.clock(), missed.caseId(), EventType.DEADLINE_PASSED,
                Map.of("deadlineId", missed.clock(), "clock", missed.clock(),
                        "dueOn", missed.dueOn().toString()),
                app.bonafide.events.EventStatus.PENDING, 0, null, Instant.now(clock), null, null);
        EventRepository.CreateResult result = events.createPendingIfFree(missed.caseId(), missed.uid(), event);
        if (result != EventRepository.CreateResult.CREATED) {
            return false; // already woken (the id is idempotent), or the case is busy right now
        }
        deadlines.markStatus(missed.caseId(), missed.clock(), Status.MISSED);
        dispatcher.dispatch(missed.caseId(), event.id());
        return true;
    }

    /** RUNNING for more than 10 minutes goes back to PENDING; PENDING older than 2 min re-dispatches. */
    private void requeueStuck() {
        Instant now = Instant.now(clock);
        for (Event stuck : events.sweepStale(now.minusSeconds(600), now.minusSeconds(120))) {
            if (stuck.status() == app.bonafide.events.EventStatus.RUNNING) {
                events.requeue(stuck.caseId(), stuck.id());
            } else {
                dispatcher.dispatch(stuck.caseId(), stuck.id());
            }
        }
    }

    private java.util.List<Deadline> missedSweep(LocalDate today) {
        return deadlines.findMissed(today);
    }
}
