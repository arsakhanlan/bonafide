package app.bonafide.agents;

import app.bonafide.config.BonafideProperties;
import com.google.adk.agents.LlmAgent;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;
import org.springframework.stereotype.Component;

/** Builds each LlmAgent once, from the prompts and the pinned model settings (BUILD_SPEC §10.1). */
@Component
public class AgentFactory {

    private final Prompts prompts;
    private final BonafideProperties properties;

    public AgentFactory(Prompts prompts, BonafideProperties properties) {
        this.prompts = prompts;
        this.properties = properties;
    }

    /** Main model, thinking LOW (never MINIMAL on this model). No tools, so outputSchema is allowed. */
    public LlmAgent reader() {
        return LlmAgent.builder()
                .name("reader")
                .description("Reads the person's papers and fills in the facts")
                .model(properties.modelMain())
                .instruction(prompts.get("reader"))
                .outputSchema(ReaderSchema.schema())
                .generateContentConfig(GenerateContentConfig.builder()
                        .thinkingConfig(ThinkingConfig.builder()
                                .thinkingLevel(new ThinkingLevel(ThinkingLevel.Known.LOW))
                                .build())
                        .build())
                .build();
    }
}
