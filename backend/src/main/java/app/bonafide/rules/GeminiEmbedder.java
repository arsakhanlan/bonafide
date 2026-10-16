package app.bonafide.rules;

import app.bonafide.config.BonafideProperties;
import com.google.genai.Client;
import com.google.genai.types.EmbedContentConfig;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class GeminiEmbedder implements Embedder {

    private final Client client;
    private final BonafideProperties properties;

    public GeminiEmbedder(BonafideProperties properties) throws IOException {
        this.properties = properties;
        this.client = Client.builder()
                .vertexAI(true)
                .project(System.getenv().getOrDefault("GOOGLE_CLOUD_PROJECT", "bonafide-cup-2026"))
                .location("global")
                .build();
    }

    @Override
    public List<Float> embed(String text) {
        try {
            EmbedContentConfig config = EmbedContentConfig.builder().outputDimensionality(768).build();
            var response = client.models.embedContent(properties.embedModel(), text, config);
            List<Float> values = response.embeddings().orElseThrow().getFirst().values().orElseThrow();
            return l2Normalise(values);
        } catch (Exception e) {
            throw new IllegalStateException("Embedding failed", e);
        }
    }

    /** Cosine distance needs L2-normalised vectors; the SDK stores what we hand it. */
    static List<Float> l2Normalise(List<Float> values) {
        double sumSquares = 0;
        for (float v : values) {
            sumSquares += (double) v * v;
        }
        double norm = Math.sqrt(sumSquares);
        if (norm == 0) {
            return values;
        }
        List<Float> normalised = new ArrayList<>(values.size());
        for (float v : values) {
            normalised.add((float) (v / norm));
        }
        return normalised;
    }
}
