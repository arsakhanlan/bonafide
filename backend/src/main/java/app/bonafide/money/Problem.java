package app.bonafide.money;

/** One thing that is wrong with the freeze, with plain words and the rule it comes from. */
public record Problem(
        ProblemCode code,
        String text,
        String ruleRef) {
}
