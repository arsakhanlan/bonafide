package app.bonafide.money;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Everything the money tracer needs, all read from papers or entered by the person. */
public record MoneyInput(
        FreezeType freezeType,
        BigDecimal heldAmount,
        BigDecimal balanceOnFreeze,
        List<DisputedPayment> disputedPayments,
        List<StatementLine> statementLines,
        String complaintNo,
        String officer,
        String policeStation,
        boolean digitalBankingBlocked,
        boolean futureCreditHold,
        Integer layer,
        LocalDate grievanceFiledOn,
        LocalDate today) {
}
