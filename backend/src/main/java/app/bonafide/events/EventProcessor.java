package app.bonafide.events;

import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.Stage;
import app.bonafide.trace.StepWriter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Claim → run → finish, with retries (BUILD_SPEC §9). Claiming first makes a double run harmless.
 */
@Component
public class EventProcessor {

    private static final Logger log = LoggerFactory.getLogger(EventProcessor.class);
    private static final int MAX_ATTEMPTS = 3;

    private final Map<EventType, EventHandler> handlers;
    private final EventRepository events;
    private final CaseRepository cases;
    private final StepWriter steps;

    public EventProcessor(
            List<EventHandler> handlerList, EventRepository events, CaseRepository cases, StepWriter steps) {
        this.handlers = handlerList.stream()
                .collect(java.util.stream.Collectors.toUnmodifiableMap(EventHandler::type, h -> h));
        this.events = events;
        this.cases = cases;
        this.steps = steps;
    }

    public void process(String caseId, String eventId) {
        Optional<Event> claimed = events.claim(caseId, eventId);
        if (claimed.isEmpty()) {
            return; // already claimed or done elsewhere
        }
        Event event = claimed.get();
        EventHandler handler = handlers.get(event.type());
        try {
            if (handler == null) {
                throw new IllegalStateException("No handler for " + event.type());
            }
            handler.handle(caseId, event);
            events.finish(caseId, eventId, EventStatus.DONE, null);
            cases.setBusy(caseId, false);
        } catch (Exception e) {
            log.error("Event {} on case {} failed (attempt {})", eventId, caseId, event.attempts(), e);
            if (event.attempts() < MAX_ATTEMPTS) {
                steps.write(caseId, "SYSTEM", "Something went wrong reading your papers. Trying again.", "FAILED");
                events.requeue(caseId, eventId);
            } else {
                steps.write(caseId, "SYSTEM", "Something went wrong reading your papers. Please upload clearer copies.", "FAILED");
                events.finish(caseId, eventId, EventStatus.FAILED, e.getMessage());
                cases.updateStageNextStep(caseId, Stage.FAILED,
                        Map.of("action", "UPLOAD_PAPERS", "text", "Upload clearer papers"));
            }
            cases.setBusy(caseId, false);
        }
    }
}
