package app.bonafide.rules;

/** One searchable piece of the rule library. */
public record RuleChunk(
        String docId,
        String ref,
        String text,
        String status,
        String date) {

    public String id() {
        return docId + "-" + ref.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
