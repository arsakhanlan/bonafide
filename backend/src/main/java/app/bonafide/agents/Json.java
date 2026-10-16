package app.bonafide.agents;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/** Parses LLM JSON with Jackson 3 (never Jackson 2, which belongs to ADK). */
public final class Json {

    private static final ObjectMapper MAPPER = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
            .build();

    private Json() {
    }

    public static <T> T parse(String text, Class<T> type) {
        try {
            return MAPPER.readValue(stripFences(text), type);
        } catch (Exception e) {
            throw new IllegalArgumentException("Not valid JSON for " + type.getSimpleName(), e);
        }
    }

    public static String write(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not serialise " + value.getClass().getSimpleName(), e);
        }
    }

    /** The model sometimes wraps the JSON in ```json fences. */
    static String stripFences(String text) {
        String trimmed = text == null ? "" : text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            String withoutOpen = firstNewline < 0 ? trimmed.substring(3) : trimmed.substring(firstNewline + 1);
            int close = withoutOpen.lastIndexOf("```");
            return close < 0 ? withoutOpen.trim() : withoutOpen.substring(0, close).trim();
        }
        return trimmed;
    }
}
