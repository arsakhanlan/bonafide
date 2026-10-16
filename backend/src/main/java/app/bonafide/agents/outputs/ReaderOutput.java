package app.bonafide.agents.outputs;

import java.util.List;

/**
 * What the Reader returns. Amounts are strings (the LLM transcribes, never calculates);
 * dates are YYYY-MM-DD. BUILD_SPEC §10.2.
 */
public record ReaderOutput(
        List<Document> documents,
        Facts facts,
        List<StatementLine> statementLines,
        String personNote,
        List<String> unsure,
        String milestone,
        String milestoneOn,
        String replySummary) {

    public record Document(
            String docId,
            String kind,
            boolean readOk,
            String summary,
            String transcript,
            List<Quote> quotes) {
    }

    public record Quote(String text, String page) {
    }

    public record Facts(
            String bank,
            String branch,
            String accountNumberSeen,
            String freezeType,
            String freezeOn,
            String heldAmount,
            String balanceOnFreeze,
            String complaintNo,
            String policeStation,
            String officer,
            String state,
            boolean digitalBankingBlocked,
            boolean futureCreditHold,
            Integer layer,
            List<DisputedPayment> disputedPayments) {
    }

    public record DisputedPayment(String utr, String on, String amount, String from) {
    }

    public record StatementLine(
            String on,
            String amount,
            String direction,
            String utr,
            String party,
            String balanceAfter) {
    }
}
