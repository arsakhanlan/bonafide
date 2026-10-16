package app.bonafide.events.handlers;

import app.bonafide.agents.FirstRunWorkflow;
import app.bonafide.events.Event;
import app.bonafide.events.EventHandler;
import app.bonafide.events.EventType;
import org.springframework.stereotype.Component;

/** The person answered the Sorter's questions; the workflow resumes from there. */
@Component
public class AnswersHandler implements EventHandler {

    private final FirstRunWorkflow workflow;

    public AnswersHandler(FirstRunWorkflow workflow) {
        this.workflow = workflow;
    }

    @Override
    public EventType type() {
        return EventType.ANSWERS;
    }

    @Override
    public void handle(String caseId, Event event) {
        workflow.run(caseId, event);
    }
}
