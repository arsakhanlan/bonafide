package app.bonafide.money;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Indian digit grouping for step texts: 178000 → "₹1,78,000", paise only when present. */
public final class IndianRupees {

    private IndianRupees() {
    }

    public static String format(BigDecimal amount) {
        if (amount == null) {
            return "₹0";
        }
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        BigDecimal whole = scaled.setScale(0, RoundingMode.DOWN);
        String paise = scaled.subtract(whole).compareTo(BigDecimal.ZERO) > 0
                ? "." + scaled.toPlainString().split("\\.")[1]
                : "";
        return "₹" + group(whole.toBigInteger().toString()) + paise;
    }

    /** Indian grouping: last 3 digits, then groups of 2 going left. */
    static String group(String digits) {
        if (digits.length() <= 3) {
            return digits;
        }
        String rest = digits.substring(0, digits.length() - 3);
        String out = digits.substring(digits.length() - 3);
        while (rest.length() > 2) {
            out = rest.substring(rest.length() - 2) + "," + out;
            rest = rest.substring(0, rest.length() - 2);
        }
        if (!rest.isEmpty()) {
            out = rest + "," + out;
        }
        return out;
    }
}
