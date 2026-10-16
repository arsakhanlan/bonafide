package app.bonafide.events.handlers;

import app.bonafide.agents.FirstRunWorkflow;
import app.bonafide.events.Event;
import app.bonafide.events.EventHandler;
import app.bonafide.events.EventType;
import org.springframework.stereotype.Component;

@Component
public class UploadHandler implements EventHandler {

    private final FirstRunWorkflow workflow;

    public UploadHandler(FirstRunWorkflow workflow) {
        this.workflow = workflow;
    }

    @Override
    public EventType type() {
        return EventType.UPLOAD;
    }

    @Override
    public void handle(String caseId, Event event) {
        workflow.run(caseId, event);
    }
}
