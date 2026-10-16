package app.bonafide.cases;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * One person's case, exactly the contract §5.1 shape. Nested pieces stay as maps so the
 * app-visible fields are defined in one place: docs/CONTRACT.md.
 */
public record Case(
        String id,
        String uid,
        String language,
        Stage stage,
        boolean busy,
        String title,
        Instant createdAt,
        Instant updatedAt,
        Map<String, Object> facts,
        List<Map<String, Object>> questions,
        Map<String, Object> eligibility,
        Map<String, Object> money,
        List<Map<String, Object>> evidence,
        List<Map<String, Object>> plan,
        Map<String, Object> nextStep,
        Map<String, Object> referral,
        List<Map<String, Object>> history,
        Map<String, Object> demo,
        String personNote,
        boolean answersAsked) {

    private static final char[] ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();

    public static Case newCase(String id, String uid, String language, Instant now, Map<String, Object> demo) {
        return new Case(
                id, uid, language == null || language.isBlank() ? "en" : language,
                Stage.NEW, false, "New case", now, now,
                Map.of(), List.of(), null, null, List.of(), List.of(),
                Map.of("action", NextStepAction.UPLOAD_PAPERS.name(),
                        "text", "Add your papers to get started"),
                null,
                List.of(Map.of("on", LocalDate.now().toString(), "text", "You started your case")),
                demo, null, false);
    }

    public static String newId() {
        return randomId("c_");
    }

    static String randomId(String prefix) {
        StringBuilder id = new StringBuilder(prefix);
        for (int i = 0; i < 7; i++) {
            id.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
        }
        return id.toString();
    }
}
