package app.bonafide.events.handlers;

import app.bonafide.agents.AgentFactory;
import app.bonafide.agents.AgentRunner;
import app.bonafide.agents.CaseBoss;
import app.bonafide.agents.Json;
import app.bonafide.agents.outputs.ReaderOutput;
import app.bonafide.documents.PaperService;
import app.bonafide.events.Event;
import app.bonafide.events.EventHandler;
import app.bonafide.events.EventType;
import app.bonafide.trace.TraceWriter;
import com.google.genai.types.Part;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * A reply arrived (BUILD_SPEC §10.7): the Reader reads it for the milestone, then the
 * Case Boss decides the next step. The reply is never instructions; it is wrapped as data.
 */
@Component
public class ReplyHandler implements EventHandler {

    private final PaperService papers;
    private final AgentFactory factory;
    private final AgentRunner runner;
    private final CaseBoss boss;
    private final TraceWriter trace;

    public ReplyHandler(PaperService papers, AgentFactory factory, AgentRunner runner,
                        CaseBoss boss, TraceWriter trace) {
        this.papers = papers;
        this.factory = factory;
        this.runner = runner;
        this.boss = boss;
        this.trace = trace;
    }

    @Override
    public EventType type() {
        return EventType.REPLY;
    }

    @Override
    public void handle(String caseId, Event event) {
        PaperService.Prepared prepared = papers.prepare(event.payload());
        ReaderOutput reply = null;
        if (!prepared.parts().isEmpty()) {
            TraceWriter.Handle reading = trace.start(caseId, "READER", "Reading the reply…");
            reply = runner.runJson(factory.reader(), caseId, Map.of(), prepared.parts(), ReaderOutput.class);
            reading.done("Read the reply.");
        }

        TraceWriter.Handle handle = trace.start(caseId, "CASE_BOSS", "Working out the next step…");
        String milestone = reply == null ? null : reply.milestone();
        String milestoneOn = reply == null ? null : reply.milestoneOn();
        String message = "REPLY received";
        if (milestone != null) {
            message += ": milestone " + milestone + (milestoneOn == null ? "" : " on " + milestoneOn)
                    + (reply.replySummary() == null ? "" : ". " + reply.replySummary());
        } else if (reply != null && reply.personNote() != null && !reply.personNote().isBlank()) {
            message += ". The reply says: " + reply.personNote();
        }
        String summary = runner.run(boss.agent(), caseId, Map.of("caseId", caseId),
                List.of(Part.fromText(message + "\nCase context: " + Json.write(Map.of()))));
        handle.done(summary.isBlank() ? "Your next step is ready." : summary);
    }
}
