package app.bonafide.events;

/** One handler per event type, looked up in a registry by the EventProcessor. */
public interface EventHandler {

    EventType type();

    /** Runs the workflow for the event. Throwing fails the attempt (retried up to 3 times). */
    void handle(String caseId, Event event) throws Exception;
}
