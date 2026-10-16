package app.bonafide.events.handlers;

import app.bonafide.agents.AgentRunner;
import app.bonafide.agents.CaseBoss;
import app.bonafide.events.Event;
import app.bonafide.events.EventHandler;
import app.bonafide.events.EventType;
import app.bonafide.trace.TraceWriter;
import com.google.genai.types.Part;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** A deadline passed: the Case Boss wakes up and prepares the next step (BUILD_SPEC §10.7). */
@Component
public class DeadlinePassedHandler implements EventHandler {

    private final CaseBoss boss;
    private final AgentRunner runner;
    private final TraceWriter trace;

    public DeadlinePassedHandler(CaseBoss boss, AgentRunner runner, TraceWriter trace) {
        this.boss = boss;
        this.runner = runner;
        this.trace = trace;
    }

    @Override
    public EventType type() {
        return EventType.DEADLINE_PASSED;
    }

    @Override
    public void handle(String caseId, Event event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.payload();
        String clock = (String) payload.get("clock");
        TraceWriter.Handle handle = trace.start(caseId, "CASE_BOSS", "A deadline passed. Preparing your next step…");
        String summary = runner.run(
                boss.agent(), caseId, Map.of("caseId", caseId),
                List.of(Part.fromText("DEADLINE_PASSED: clock " + clock)));
        handle.done(summary.isBlank() ? "Your next step is ready." : summary);
    }
}
