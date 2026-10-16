package app.bonafide.events;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/** Bounded virtual-thread executor; each event gets its own MDC for clean logs. */
@Component
public class InProcessEventDispatcher implements EventDispatcher {

    private static final int MAX_IN_FLIGHT = 8;

    private final Semaphore semaphore = new Semaphore(MAX_IN_FLIGHT);
    private final ExecutorService executor = Executors.newThreadPerTaskExecutor(
            Thread.ofVirtual().name("bonafide-event-", 0).factory());
    private final EventProcessor processor;

    public InProcessEventDispatcher(EventProcessor processor) {
        this.processor = processor;
    }

    @Override
    public void dispatch(String caseId, String eventId) {
        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }
        executor.submit(() -> {
            MDC.put("caseId", caseId);
            MDC.put("eventId", eventId);
            try {
                processor.process(caseId, eventId);
            } finally {
                MDC.clear();
                semaphore.release();
            }
        });
    }
}
