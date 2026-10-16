package app.bonafide.deadlines;

/** One clock from clocks.json: whose deadline, how many days, and what starts it. */
public record ClockRule(
        String clock,
        String who,
        int days,
        String title,
        String ruleRef,
        String status,
        String startedBy) {

    public boolean inForce() {
        return "IN_FORCE".equals(status);
    }
}
