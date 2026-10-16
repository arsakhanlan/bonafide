package app.bonafide.letters;

import app.bonafide.rules.RuleChunk;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Everything the DraftChecker needs, built by the LetterService before the loop runs. */
public record CheckContext(
        LetterSpec spec,
        List<RuleChunk> chunks,
        BigDecimal disputed,
        BigDecimal frozen,
        BigDecimal release,
        double groundingMin,
        Map<String, Object> facts,
        List<Map<String, Object>> evidence,
        String personNote) {

    public RuleChunk chunkById(String chunkId) {
        return chunks.stream().filter(c -> c.id().equals(chunkId)).findFirst().orElse(null);
    }
}
