package app.bonafide.trace;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.support.TestFakes.InMemoryStepWriter;
import org.junit.jupiter.api.Test;

class TraceWriterTest {

    private final InMemoryStepWriter steps = new InMemoryStepWriter();
    private final TraceWriter writer = new TraceWriter(steps);

    @Test
    void aHandleStartsRunningAndFinishesDoneInTheSameDocument() {
        TraceWriter.Handle handle = writer.start("c1", "READER", "Reading your papers…");

        assertThat(steps.steps).hasSize(1);
        assertThat(steps.steps.getFirst().get("status")).isEqualTo("RUNNING");

        handle.done("Read 3 papers");

        assertThat(steps.steps).hasSize(1);
        assertThat(steps.steps.getFirst().get("status")).isEqualTo("DONE");
        assertThat(steps.steps.getFirst().get("text")).isEqualTo("Read 3 papers");
    }

    @Test
    void aHandleCanFail() {
        TraceWriter.Handle handle = writer.start("c1", "READER", "Reading…");
        handle.fail("Could not read this paper");
        assertThat(steps.steps.getFirst().get("status")).isEqualTo("FAILED");
    }

    @Test
    void infoWritesSeparateSteps() {
        TraceWriter.Handle handle = writer.start("c1", "MONEY", "Doing the maths…");
        handle.info("Matched one disputed payment");
        handle.done("Done");
        assertThat(steps.steps).hasSize(2);
        assertThat(steps.steps.get(1).get("status")).isEqualTo("INFO");
    }
}
