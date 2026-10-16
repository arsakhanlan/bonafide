package app.bonafide.letters;

import java.util.List;

/** One letter kind from letters.json: who it goes to and what it must contain. */
public record LetterSpec(
        LetterKind kind,
        String title,
        String to,
        String purpose,
        List<String> requiredFields,
        List<String> mustIncludeRefs,
        List<String> guidance,
        int maxWords) {
}
