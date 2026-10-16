package app.bonafide.documents;

import java.util.regex.Pattern;

/** Privacy masks (BUILD_SPEC §10.2): last 4 digits of accounts; Aadhaar/PAN fully masked. */
public final class Masking {

    private static final Pattern AADHAAR = Pattern.compile("\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b");
    private static final Pattern PAN = Pattern.compile("\\b[A-Z]{5}\\d{4}[A-Z]\\b");

    private Masking() {
    }

    public static String mask(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String masked = AADHAAR.matcher(text).replaceAll("•••• •••• ••••");
        return PAN.matcher(masked).replaceAll("PAN•••••");
    }

    /** "123456789012" → "••9012"; anything shorter than 4 digits stays hidden. */
    public static String accountLast4(String accountNumber) {
        if (accountNumber == null) {
            return null;
        }
        String digits = accountNumber.replaceAll("[^0-9]", "");
        if (digits.length() < 4) {
            return "••";
        }
        return "••" + digits.substring(digits.length() - 4);
    }
}
