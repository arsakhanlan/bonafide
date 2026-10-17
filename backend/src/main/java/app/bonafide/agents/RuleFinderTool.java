package app.bonafide.agents;

import app.bonafide.rules.ChunkRanker;
import app.bonafide.rules.Embedder;
import app.bonafide.rules.RuleChunk;
import app.bonafide.rules.RuleRepository;
import com.google.adk.tools.Annotations.Schema;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** The RuleFinder's searchRules tool: embed the query, vector-search the library, keep the top 6. */
@Component
public class RuleFinderTool {

    private static final Logger log = LoggerFactory.getLogger(RuleFinderTool.class);

    private final Embedder embedder;
    private final RuleRepository rules;
    private final ChunkRanker ranker;

    public RuleFinderTool(Embedder embedder, RuleRepository rules, ChunkRanker ranker) {
        this.embedder = embedder;
        this.rules = rules;
        this.ranker = ranker;
    }

    public Map<String, Object> searchRules(
            @Schema(name = "query", description = "A short query describing what the letter needs to prove")
            String query) {
        List<Map<String, String>> results = new ArrayList<>();
        try {
            List<RuleChunk> nearest = rules.findNearest(toArray(embedder.embed(query)), 20);
            List<RuleChunk> top = ranker.rank(query, nearest, 6);
            for (RuleChunk chunk : top) {
                Map<String, String> entry = new HashMap<>();
                entry.put("chunkId", chunk.id());
                entry.put("ref", chunk.ref());
                entry.put("text", chunk.text());
                results.add(entry);
            }
        } catch (Exception e) {
            // The vector index may still be building; the must-include chunks still cover the letter.
            log.warn("Rule search failed: {}", e.getMessage());
        }
        return Map.of("chunks", results);
    }

    private static double[] toArray(List<Float> values) {
        double[] array = new double[values.size()];
        for (int i = 0; i < values.size(); i++) {
            array[i] = values.get(i);
        }
        return array;
    }
}
