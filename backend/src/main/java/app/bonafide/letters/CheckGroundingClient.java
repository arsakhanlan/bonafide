package app.bonafide.letters;

import com.google.cloud.discoveryengine.v1.CheckGroundingRequest;
import com.google.cloud.discoveryengine.v1.CheckGroundingSpec;
import com.google.cloud.discoveryengine.v1.GroundedGenerationServiceClient;
import com.google.cloud.discoveryengine.v1.GroundingFact;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class CheckGroundingClient implements Grounding {

    private static final String PROJECT =
            System.getenv().getOrDefault("GOOGLE_CLOUD_PROJECT", "bonafide-cup-2026");

    @Override
    public Float check(String answerCandidate, List<String> facts, double citationThreshold) {
        try (GroundedGenerationServiceClient client = GroundedGenerationServiceClient.create()) {
            CheckGroundingRequest.Builder request = CheckGroundingRequest.newBuilder()
                    .setGroundingConfig("projects/" + PROJECT
                            + "/locations/global/groundingConfigs/default_grounding_config")
                    .setAnswerCandidate(answerCandidate)
                    .setGroundingSpec(CheckGroundingSpec.newBuilder()
                            .setCitationThreshold(citationThreshold)
                            .build());
            for (String fact : facts) {
                request.addFacts(GroundingFact.newBuilder().setFactText(fact).build());
            }
            return client.checkGrounding(request.build()).getSupportScore();
        } catch (Exception e) {
            // Grounding unavailable (permissions, outage): the quote checker still gates the letter.
            return null;
        }
    }
}
