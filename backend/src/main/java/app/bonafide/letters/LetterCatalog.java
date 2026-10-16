package app.bonafide.letters;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/** Loads letters.json: one spec per letter kind (BUILD_SPEC §13). */
@Component
public class LetterCatalog {

    private final Map<LetterKind, LetterSpec> specs = new LinkedHashMap<>();

    public LetterCatalog() {
        try {
            Map<?, ?> raw = new JsonMapper().readValue(
                    new ClassPathResource("letters.json").getInputStream(), Map.class);
            for (Map.Entry<?, ?> entry : raw.entrySet()) {
                LetterKind kind = LetterKind.valueOf((String) entry.getKey());
                @SuppressWarnings("unchecked")
                Map<String, Object> spec = (Map<String, Object>) entry.getValue();
                specs.put(kind, new LetterSpec(
                        kind,
                        (String) spec.get("title"),
                        (String) spec.get("to"),
                        (String) spec.get("purpose"),
                        (List<String>) spec.get("requiredFields"),
                        (List<String>) spec.get("mustIncludeRefs"),
                        (List<String>) spec.get("guidance"),
                        ((Number) spec.getOrDefault("maxWords", 450)).intValue()));
            }
        } catch (IOException e) {
            throw new IllegalStateException("letters.json is missing or unreadable", e);
        }
    }

    public LetterSpec get(LetterKind kind) {
        LetterSpec spec = specs.get(kind);
        if (spec == null) {
            throw new IllegalArgumentException("Unknown letter kind: " + kind);
        }
        return spec;
    }
}
