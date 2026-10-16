package app.bonafide.trace;

import org.springframework.stereotype.Component;

/**
 * The live steps screen (contract §5.4): start a RUNNING step, then update the same
 * document to DONE/FAILED with plain words and a millisecond count.
 */
@Component
public class TraceWriter {

    private final StepWriter steps;

    public TraceWriter(StepWriter steps) {
        this.steps = steps;
    }

    public Handle start(String caseId, String agent, String text) {
        return new Handle(caseId, agent, steps.write(caseId, agent, text, "RUNNING"));
    }

    public class Handle {

        private final String caseId;
        private final String agent;
        private final String stepId;
        private final long startedNanos = System.nanoTime();

        private Handle(String caseId, String agent, String stepId) {
            this.caseId = caseId;
            this.agent = agent;
            this.stepId = stepId;
        }

        public void done(String text) {
            steps.update(caseId, stepId, text, "DONE", ms());
        }

        public void fail(String text) {
            steps.update(caseId, stepId, text, "FAILED", ms());
        }

        public void info(String text) {
            steps.write(caseId, agent, text, "INFO");
        }

        private long ms() {
            return (System.nanoTime() - startedNanos) / 1_000_000;
        }
    }
}
