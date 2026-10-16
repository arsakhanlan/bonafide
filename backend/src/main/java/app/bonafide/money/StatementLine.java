package app.bonafide.money;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One line of the bank statement, as read by the Reader. */
public record StatementLine(
        LocalDate on,
        BigDecimal amount,
        Direction direction,
        String utr,
        String party,
        BigDecimal balanceAfter) {

    public enum Direction {
        CREDIT,
        DEBIT
    }

    public boolean isCredit() {
        return direction == Direction.CREDIT;
    }
}
