package app.bonafide.events;

import java.time.Instant;
import java.util.Map;

/** One thing that happened on a case (contract event model, BUILD_SPEC §7). */
public record Event(
        String id,
        String caseId,
        EventType type,
        Map<String, Object> payload,
        EventStatus status,
        int attempts,
        String error,
        Instant createdAt,
        Instant startedAt,
        Instant finishedAt) {

    private static final char[] ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789".toCharArray();
    private static final java.security.SecureRandom RANDOM = new java.security.SecureRandom();

    public static Event newPending(String caseId, EventType type, Map<String, Object> payload, Instant now) {
        StringBuilder id = new StringBuilder("e_");
        for (int i = 0; i < 7; i++) {
            id.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
        }
        return new Event(id.toString(), caseId, type, payload,
                EventStatus.PENDING, 0, null, now, null, null);
    }
}
