package app.bonafide.rules;

import app.bonafide.money.ProblemCode;
import java.io.IOException;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** Loads rule-map.json (plain words for problems; must-include chunks come with the RuleFinder). */
@Component
public class RuleMapLoader {

    private final RuleMap ruleMap;

    public RuleMapLoader() {
        ObjectMapper mapper = new ObjectMapper();
        try (var in = new ClassPathResource("rule-map.json").getInputStream()) {
            Map<?, ?> raw = mapper.readValue(in, Map.class);
            this.ruleMap = new RuleMap(parseProblems(raw.get("problems")));
        } catch (IOException e) {
            throw new IllegalStateException("rule-map.json is missing or unreadable", e);
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<ProblemCode, RuleMap.ProblemText> parseProblems(Object problems) {
        Map<String, Map<String, String>> raw = (Map<String, Map<String, String>>) problems;
        return raw.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> ProblemCode.valueOf(e.getKey()),
                        e -> new RuleMap.ProblemText(e.getValue().get("text"), e.getValue().get("ruleRef"))));
    }

    public RuleMap ruleMap() {
        return ruleMap;
    }
}
