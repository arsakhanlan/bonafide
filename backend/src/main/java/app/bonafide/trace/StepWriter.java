package app.bonafide.trace;

/** Writes the live steps the app renders (contract §5.4). */
public interface StepWriter {

    /** Writes the step and returns its id, so the caller can update the same document later. */
    String write(String caseId, String agent, String text, String status);

    void update(String caseId, String stepId, String text, String status, Long ms);
}
