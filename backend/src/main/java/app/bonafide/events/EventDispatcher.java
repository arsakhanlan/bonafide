package app.bonafide.events;

/** Runs one event's handler in the background. In v1: in-process; Cloud Tasks can be swapped in. */
public interface EventDispatcher {

    void dispatch(String caseId, String eventId);
}
