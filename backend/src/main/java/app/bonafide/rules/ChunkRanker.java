package app.bonafide.rules;

import java.util.List;

/** Re-ranks vector-search candidates by relevance to the query; falls back to the given order. */
public interface ChunkRanker {

    List<RuleChunk> rank(String query, List<RuleChunk> candidates, int keep);
}
