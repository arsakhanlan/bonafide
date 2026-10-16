package app.bonafide.api;

import java.nio.charset.StandardCharsets;
import tools.jackson.databind.ObjectMapper;

/** The one error shape the app expects: {"error": {"code", "message"}} (contract §4.7). */
public final class ErrorResponses {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ErrorResponses() {
    }

    public static byte[] bytes(String code, String message) {
        try {
            return MAPPER.writeValueAsBytes(new Envelope(new ErrorBody(code, message)));
        } catch (Exception e) {
            return ("{\"error\":{\"code\":\"INTERNAL\",\"message\":\"Unexpected error\"}}")
                    .getBytes(StandardCharsets.UTF_8);
        }
    }

    private record Envelope(ErrorBody error) {
    }

    private record ErrorBody(String code, String message) {
    }
}
