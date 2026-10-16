package app.bonafide.rules;

import app.bonafide.money.ProblemCode;
import java.util.Map;

/** The rule-map.json content: plain words and rule references for each problem code. */
public record RuleMap(
        Map<ProblemCode, ProblemText> problems) {

    public record ProblemText(String text, String ruleRef) {
    }
}
