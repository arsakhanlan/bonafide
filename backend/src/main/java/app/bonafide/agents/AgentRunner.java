package app.bonafide.agents;

import com.google.adk.agents.BaseAgent;
import com.google.adk.agents.RunConfig;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Runs an ADK agent once, in memory, and hands back the final text (BUILD_SPEC §10.1). */
@Component
public class AgentRunner {

    private static final String APP_NAME = "bonafide";

    public String run(BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts) {
        InMemoryRunner runner = new InMemoryRunner(agent, APP_NAME);
        Session session = runner.sessionService()
                .createSession(APP_NAME, caseId, initialState, sessionId(caseId))
                .blockingGet();
        return runOnce(runner, session, parts);
    }

    /** Parses the final text as JSON; on a parse failure, asks once more for clean JSON. */
    public <T> T runJson(
            BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts, Class<T> type) {
        InMemoryRunner runner = new InMemoryRunner(agent, APP_NAME);
        Session session = runner.sessionService()
                .createSession(APP_NAME, caseId, initialState, sessionId(caseId))
                .blockingGet();
        try {
            return Json.parse(runOnce(runner, session, parts), type);
        } catch (IllegalArgumentException first) {
            String retry = runOnce(runner, session,
                    List.of(Part.fromText("Return only valid JSON matching the schema.")));
            return Json.parse(retry, type);
        }
    }

    private static String runOnce(InMemoryRunner runner, Session session, List<Part> parts) {
        List<String> finalTexts = new ArrayList<>();
        runner.runAsync(session.userId(), session.id(),
                        Content.fromParts(parts.toArray(new Part[0])), RunConfig.builder().build())
                .blockingForEach(event -> {
                    if (event.finalResponse()) {
                        finalTexts.add(event.stringifyContent());
                    }
                });
        return String.join("\n", finalTexts);
    }

    private static String sessionId(String caseId) {
        return "case-" + caseId;
    }
}
