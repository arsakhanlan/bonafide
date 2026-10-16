package app.bonafide.agents.outputs;

import java.util.List;

/** The RuleFinder's final answer: the chunks it wants, with one line why. */
public record RuleFinderOutput(List<ChunkPick> chunks) {

    public record ChunkPick(String chunkId, String why) {
    }
}
