package app.bonafide.rules;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Word-for-word quote check (BUILD_SPEC §14): both sides are normalised the same way,
 * then the quote must appear as one unbroken piece. Ellipses are never allowed.
 */
public final class QuoteChecker {

    private QuoteChecker() {
    }

    public static boolean contains(String sourceText, String quote) {
        if (sourceText == null || quote == null) {
            return false;
        }
        String normalized = normalize(quote);
        if (normalized.contains("…") || normalized.contains("...")) {
            return false;
        }
        return normalize(sourceText).contains(normalized);
    }

    static String normalize(String text) {
        String nfkc = Normalizer.normalize(text, Normalizer.Form.NFKC);
        String punctuation = nfkc
                .replace('‘', '\'')
                .replace('’', '\'')
                .replace('“', '"')
                .replace('”', '"')
                .replace('—', '-')
                .replace('–', '-');
        String joinedHyphens = punctuation.replaceAll("-\\s+", "");
        String spaces = joinedHyphens.replaceAll("\\s+", " ");
        return spaces.trim().toLowerCase(Locale.ROOT);
    }
}
