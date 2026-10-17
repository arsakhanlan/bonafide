package app.bonafide.rules;

import app.bonafide.agents.Json;
import app.bonafide.config.BonafideProperties;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.Part;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The small model re-ranks the top-20 vector hits and keeps the best 6 (BUILD_SPEC §14's
 * optional ranking step). Any failure falls back to the vector order — search must never
 * block a letter.
 */
@Component
@Profile("!test")
public class GeminiChunkRanker implements ChunkRanker {

    private static final Logger log = LoggerFactory.getLogger(GeminiChunkRanker.class);

    private final Client client;
    private final BonafideProperties properties;

    public GeminiChunkRanker(BonafideProperties properties) throws IOException {
        this.properties = properties;
        this.client = Client.builder()
                .vertexAI(true)
                .project(System.getenv().getOrDefault("GOOGLE_CLOUD_PROJECT", "bonafide-cup-2026"))
                .location("global")
                .build();
    }

    @Override
    public List<RuleChunk> rank(String query, List<RuleChunk> candidates, int keep) {
        if (candidates.size() <= keep) {
            return dedupe(candidates);
        }
        try {
            Map<String, RuleChunk> byId = new LinkedHashMap<>();
            StringBuilder numbered = new StringBuilder();
            int n = 0;
            for (RuleChunk chunk : candidates) {
                byId.put(chunk.id(), chunk);
                numbered.append("[").append(++n).append("] ").append(chunk.ref())
                        .append(": ").append(chunk.text()).append("\n\n");
            }
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .thinkingConfig(ThinkingConfig.builder()
                            .thinkingLevel(new ThinkingLevel(ThinkingLevel.Known.MEDIUM))
                            .build())
                    .build();
            String answer = client.models.generateContent(
                            properties.modelSmall(),
                            List.of(Content.builder().role("user").parts(List.of(Part.fromText(
                                    "Query: " + query + "\n\nRank these rule passages by relevance to the query. "
                                            + "Return only a JSON array of the numbers of the " + keep + " most relevant, "
                                            + "most relevant first, like [3,1,7].\n\n" + numbered))).build()),
                            config)
                    .text();
            List<Integer> order = Json.parse(answer, new tools.jackson.core.type.TypeReference<List<Integer>>() {});
            List<RuleChunk> ranked = new ArrayList<>();
            int index = 0;
            for (RuleChunk chunk : candidates) {
                index++;
                if (order.contains(index)) {
                    ranked.add(chunk);
                }
            }
            // Missing picks are topped up in vector order.
            for (RuleChunk chunk : candidates) {
                if (ranked.size() >= keep) {
                    break;
                }
                if (!ranked.contains(chunk)) {
                    ranked.add(chunk);
                }
            }
            return dedupe(ranked);
        } catch (Exception e) {
            log.warn("Re-ranking failed, using vector order: {}", e.getMessage());
            return dedupe(candidates.subList(0, Math.min(keep, candidates.size())));
        }
    }

    /** One chunk per ref — the cleanest citation set for the letter. */
    private static List<RuleChunk> dedupe(List<RuleChunk> chunks) {
        Map<String, RuleChunk> byRef = new LinkedHashMap<>();
        for (RuleChunk chunk : chunks) {
            byRef.putIfAbsent(chunk.ref(), chunk);
        }
        return new ArrayList<>(byRef.values());
    }
}
