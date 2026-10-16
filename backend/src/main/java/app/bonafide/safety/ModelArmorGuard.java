package app.bonafide.safety;

import app.bonafide.config.BonafideProperties;
import com.google.cloud.modelarmor.v1.DataItem;
import com.google.cloud.modelarmor.v1.FilterMatchState;
import com.google.cloud.modelarmor.v1.ModelArmorClient;
import com.google.cloud.modelarmor.v1.ModelArmorSettings;
import com.google.cloud.modelarmor.v1.SanitizeUserPromptRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

/**
 * Google Model Armor on every text taken from papers. The template lives in us-central1
 * (asia-southeast1 rejects writes; see DECISIONS).
 */
@Component
@ConditionalOnExpression("!'${bonafide.model-armor-template:}'.isBlank()")
public class ModelArmorGuard implements Guard {

    private static final String PROJECT =
            System.getenv().getOrDefault("GOOGLE_CLOUD_PROJECT", "bonafide-cup-2026");

    private final BonafideProperties properties;

    public ModelArmorGuard(BonafideProperties properties) {
        this.properties = properties;
    }

    @Override
    public GuardResult check(String text) {
        if (text == null || text.isBlank()) {
            return GuardResult.clean();
        }
        List<String> reasons = new ArrayList<>();
        try (ModelArmorClient client = ModelArmorClient.create(ModelArmorSettings.newBuilder()
                .setEndpoint("modelarmor.us-central1.rep.googleapis.com:443")
                .build())) {
            for (String piece : pieces(text)) {
                SanitizeUserPromptRequest request = SanitizeUserPromptRequest.newBuilder()
                        .setName("projects/" + PROJECT + "/locations/us-central1/templates/"
                                + properties.modelArmorTemplate())
                        .setUserPromptData(DataItem.newBuilder().setText(piece).build())
                        .build();
                var response = client.sanitizeUserPrompt(request);
                if (response.getSanitizationResult().getFilterMatchState() == FilterMatchState.MATCH_FOUND) {
                    reasons.add("prompt-injection filter matched");
                }
            }
        } catch (IOException e) {
            return GuardResult.clean(); // the guard being down must not block real people
        }
        return reasons.isEmpty() ? GuardResult.clean() : new GuardResult(true, reasons);
    }

    /** Very long papers are checked in pieces. */
    static List<String> pieces(String text) {
        if (text.length() <= 8000) {
            return List.of(text);
        }
        List<String> pieces = new ArrayList<>();
        for (int i = 0; i < text.length(); i += 8000) {
            pieces.add(text.substring(i, Math.min(text.length(), i + 8000)));
        }
        return pieces;
    }
}
