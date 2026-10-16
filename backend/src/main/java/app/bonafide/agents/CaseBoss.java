package app.bonafide.agents;

import com.google.adk.agents.LlmAgent;
import com.google.adk.tools.FunctionTool;
import com.google.adk.tools.ToolContext;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;
import org.springframework.stereotype.Component;

/** The long-running coordinator (BUILD_SPEC §10.7): one agent, tools bound per run. */
@Component
public class CaseBoss {

    private final AgentFactory factory;
    private final CaseBossTools tools;

    public CaseBoss(AgentFactory factory, CaseBossTools tools) {
        this.factory = factory;
        this.tools = tools;
    }

    public LlmAgent agent() {
        return LlmAgent.builder()
                .name("caseboss")
                .description("Decides the next step of a case and calls the tools to do it")
                .model(factory.properties().modelMain())
                .instruction(factory.prompts().get("caseboss"))
                .tools(
                        FunctionTool.create(tools, method("getCase", ToolContext.class)),
                        FunctionTool.create(tools, method("recordMilestone", String.class, String.class, String.class, ToolContext.class)),
                        FunctionTool.create(tools, method("draftLetter", String.class, String.class, boolean.class, ToolContext.class)),
                        FunctionTool.create(tools, method("setStage", String.class, String.class, ToolContext.class)),
                        FunctionTool.create(tools, method("refer", String.class, String.class, ToolContext.class)),
                        FunctionTool.create(tools, method("addHistory", String.class, ToolContext.class)))
                .generateContentConfig(GenerateContentConfig.builder()
                        .thinkingConfig(ThinkingConfig.builder()
                                .thinkingLevel(new ThinkingLevel(ThinkingLevel.Known.MEDIUM))
                                .build())
                        .build())
                .build();
    }

    private static java.lang.reflect.Method method(String name, Class<?>... params) {
        try {
            return CaseBossTools.class.getMethod(name, params);
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException("Missing CaseBoss tool " + name, e);
        }
    }
}
