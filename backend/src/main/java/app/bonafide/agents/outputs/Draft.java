package app.bonafide.agents.outputs;

import java.util.List;

/** The Writer's draft: plain English body with [n] markers and word-for-word citations. */
public record Draft(
        String title,
        String to,
        String subject,
        String body,
        List<Citation> citations,
        List<String> attachments) {

    public record Citation(int n, String chunkId, String quote) {
    }
}
