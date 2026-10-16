package app.bonafide.events;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.cases.Stage;
import app.bonafide.support.TestFakes.InMemoryCaseRepository;
import app.bonafide.support.TestFakes.InMemoryEventRepository;
import app.bonafide.support.TestFakes.InMemoryStepWriter;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EventProcessorTest {

    private final InMemoryCaseRepository cases = new InMemoryCaseRepository();
    private final InMemoryEventRepository events = new InMemoryEventRepository(cases);
    private final InMemoryStepWriter steps = new InMemoryStepWriter();
    private final AtomicInteger runs = new AtomicInteger();

    private EventProcessor processor;

    @BeforeEach
    void setUp() {
        runs.set(0);
        EventHandler handler = new EventHandler() {
            @Override
            public EventType type() {
                return EventType.UPLOAD;
            }

            @Override
            public void handle(String caseId, Event event) {
                runs.incrementAndGet();
            }
        };
        processor = new EventProcessor(List.of(handler), events, cases, steps);
        cases.save(app.bonafide.cases.Case.newCase("c1", "u1", "en", Instant.now(), null));
        events.createPendingIfFree("c1", "u1",
                Event.newPending("c1", EventType.UPLOAD, Map.of(), Instant.now()));
    }

    @Test
    void processingTwiceRunsTheHandlerOnce() {
        String eventId = events.events.keySet().iterator().next().split("/")[1];

        processor.process("c1", eventId);
        processor.process("c1", eventId); // the second claim finds RUNNING, so it stops

        assertThat(runs.get()).isEqualTo(1);
        Event event = events.events.get("c1/" + eventId);
        assertThat(event.status()).isEqualTo(EventStatus.DONE);
        assertThat(cases.cases.get("c1").busy()).isFalse();
    }

    @Test
    void aFailingHandlerIsRetriedThenFailsTheCase() {
        EventHandler failing = new EventHandler() {
            @Override
            public EventType type() {
                return EventType.UPLOAD;
            }

            @Override
            public void handle(String caseId, Event event) throws Exception {
                throw new IllegalStateException("boom");
            }
        };
        processor = new EventProcessor(List.of(failing), events, cases, steps);
        String eventId = events.events.keySet().iterator().next().split("/")[1];

        processor.process("c1", eventId); // attempt 1 → requeue
        processor.process("c1", eventId); // attempt 2 → requeue
        processor.process("c1", eventId); // attempt 3 → FAILED

        Event event = events.events.get("c1/" + eventId);
        assertThat(event.status()).isEqualTo(EventStatus.FAILED);
        assertThat(cases.cases.get("c1").stage()).isEqualTo(Stage.FAILED);
        assertThat(cases.cases.get("c1").busy()).isFalse();
        assertThat(steps.steps).extracting(s -> s.get("text"))
                .contains("Something went wrong reading your papers. Trying again.");
    }
}
