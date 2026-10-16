package app.bonafide.money;

import java.math.BigDecimal;
import java.util.List;

/**
 * disputed: how much of the money is actually linked to the fraud.
 * frozen: how much the person cannot touch.
 * release: how much should be free. Never below zero.
 */
public record MoneyResult(
        BigDecimal disputed,
        BigDecimal frozen,
        BigDecimal release,
        List<Problem> problems,
        boolean unsure) {
}
