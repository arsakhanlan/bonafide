package app.bonafide.agents;

import app.bonafide.config.BonafideProperties;
import app.bonafide.letters.DraftChecker;
import com.google.adk.agents.LlmAgent;
import com.google.adk.agents.LoopAgent;
import com.google.adk.tools.ExitLoopTool;
import com.google.adk.tools.FunctionTool;
import com.google.adk.tools.ToolContext;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;
import org.springframework.stereotype.Component;

/** Builds each LlmAgent once, from the prompts and the pinned model settings (BUILD_SPEC §10.1). */
@Component
public class AgentFactory {

    private final Prompts prompts;
    private final BonafideProperties properties;
    private final RuleFinderTool ruleFinderTool;
    private final DraftChecker draftChecker;

    public Prompts prompts() {
        return prompts;
    }

    public BonafideProperties properties() {
        return properties;
    }

    public AgentFactory(Prompts prompts, BonafideProperties properties,
                        RuleFinderTool ruleFinderTool, DraftChecker draftChecker) {
        this.prompts = prompts;
        this.properties = properties;
        this.ruleFinderTool = ruleFinderTool;
        this.draftChecker = draftChecker;
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

    /** Small model with MEDIUM thinking: its default can stop tool use early. */
    public LlmAgent sorter() {
        return LlmAgent.builder()
                .name("sorter")
                .description("Checks whether the case is genuine")
                .model(properties.modelSmall())
                .instruction(prompts.get("sorter"))
                .outputSchema(SorterSchema.schema())
                .generateContentConfig(GenerateContentConfig.builder()
                        .thinkingConfig(ThinkingConfig.builder()
                                .thinkingLevel(new ThinkingLevel(ThinkingLevel.Known.MEDIUM))
                                .build())
                        .build())
                .build();
    }

    /** Has a tool, so no outputSchema; its final text is JSON parsed by code. */
    public LlmAgent rulefinder() {
        return LlmAgent.builder()
                .name("rulefinder")
                .description("Finds the rules and rulings that fit this case")
                .model(properties.modelMain())
                .instruction(prompts.get("rulefinder"))
                .tools(FunctionTool.create(ruleFinderTool, method(RuleFinderTool.class, "searchRules", String.class)))
                .generateContentConfig(medium())
                .build();
    }

    public LlmAgent writer() {
        return LlmAgent.builder()
                .name("writer")
                .description("Writes the person's letter")
                .model(properties.modelMain())
                .instruction(prompts.get("writer"))
                .outputSchema(DraftSchema.schema())
                .outputKey("draft")
                .generateContentConfig(medium())
                .build();
    }

    public LlmAgent checker() {
        return LlmAgent.builder()
                .name("checker")
                .description("Checks the draft and ends the loop when it passes")
                .model(properties.modelSmall())
                .instruction(prompts.get("checker"))
                .tools(
                        FunctionTool.create(draftChecker,
                                method(DraftChecker.class, "checkDraft", ToolContext.class)),
                        ExitLoopTool.INSTANCE)
                .generateContentConfig(medium())
                .build();
    }

    /** Writer ⇄ Checker, at most 3 rounds (BUILD_SPEC §10.6). */
    public LoopAgent letterLoop() {
        return LoopAgent.builder()
                .name("letter_loop")
                .subAgents(writer(), checker())
                .maxIterations(3)
                .build();
    }

    /** One quick writer+checker round for the grounding retry pass. */
    public LoopAgent letterLoopOnce() {
        return LoopAgent.builder()
                .name("letter_loop_once")
                .subAgents(writer(), checker())
                .maxIterations(1)
                .build();
    }

    private static java.lang.reflect.Method method(Class<?> cls, String name, Class<?>... params) {
        try {
            return cls.getMethod(name, params);
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException("Missing tool method " + cls.getSimpleName() + "." + name, e);
        }
    }

    private static GenerateContentConfig medium() {
        return GenerateContentConfig.builder()
                .thinkingConfig(ThinkingConfig.builder()
                        .thinkingLevel(new ThinkingLevel(ThinkingLevel.Known.MEDIUM))
                        .build())
                .build();
    }
}
