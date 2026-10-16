package app.bonafide.money;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One payment the police say is linked to the fraud, from the notice or complaint. */
public record DisputedPayment(
        String utr,
        LocalDate on,
        BigDecimal amount,
        String from) {
}
