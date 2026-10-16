package app.bonafide.deadlines;

import java.time.LocalDate;

/** One running clock (contract §5.6). The id is the clock name, so a clock can't start twice. */
public record Deadline(
        String clock,
        String who,
        String title,
        LocalDate startOn,
        LocalDate dueOn,
        Status status,
        String ruleRef,
        boolean demo,
        String caseId,
        String uid) {

    public enum Status {
        PENDING,
        MET,
        MISSED,
        CANCELLED
    }

    public String id() {
        return clock;
    }
}
