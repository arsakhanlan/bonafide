package app.bonafide.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class ErrorResponsesTest {

    @Test
    void errorJsonMatchesTheContractShape() {
        String json = new String(ErrorResponses.bytes("BUSY", "Agents are still working on this case."),
                StandardCharsets.UTF_8);
        assertThat(json).isEqualTo("{\"error\":{\"code\":\"BUSY\",\"message\":\"Agents are still working on this case.\"}}");
    }
}
