package app.bonafide.letters;

import app.bonafide.agents.outputs.Draft;
import app.bonafide.agents.outputs.Draft.Citation;
import app.bonafide.money.IndianRupees;
import app.bonafide.rules.RuleChunk;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * The safety net (BUILD_SPEC §10.6's spirit): when the AI draft does not pass every check,
 * the code assembles a plain letter from the case facts. Its quotes are the rule chunks'
 * own sentences, so they pass the word-for-word check by construction.
 */
public final class SafeLetter {

    private SafeLetter() {
    }

    public static Draft build(LetterKind kind, CheckContext context) {
        Map<String, Object> facts = context.facts() == null ? Map.of() : context.facts();
        String bank = str(facts.get("bank"));
        String last4 = str(facts.get("accountLast4"));
        String freezeOn = str(facts.get("freezeOn"));
        String complaint = str(facts.get("complaintNo"));
        String station = str(facts.get("policeStation"));
        String utr = firstUtr(facts);
        String disputed = IndianRupees.format(context.disputed());
        String frozen = IndianRupees.format(context.frozen());
        String release = IndianRupees.format(context.release());

        List<Citation> citations = new ArrayList<>();
        StringBuilder body = new StringBuilder();
        body.append("My account ending ").append("••").append(last4)
                .append(" was frozen on ").append(freezeOn).append(". ");
        if (!complaint.isBlank()) {
            body.append("The complaint number is ").append(complaint);
            if (!station.isBlank()) {
                body.append(" from ").append(station);
            }
            body.append(". ");
        }
        if (!utr.isBlank()) {
            body.append("The disputed payment is UTR ").append(utr)
                    .append(" of ").append(disputed).append(". ");
        }
        body.append("The frozen amount is ").append(frozen)
                .append(" and ").append(release).append(" should be released");
        int n = 1;
        for (RuleChunk chunk : context.chunks()) {
            if (context.spec().mustIncludeRefs().contains(chunk.ref())) {
                String sentence = firstSentence(chunk.text());
                if (sentence != null) {
                    body.append(" [").append(n).append("]");
                    citations.add(new Citation(n, chunk.id(), sentence));
                    n++;
                }
            }
        }
        body.append(". ");
        body.append("I offer to keep the disputed amount on hold. ")
                .append("Please share the police details and file my grievance on the grievance ")
                .append("module within 7 days. Enclosed: the evidence. ")
                .append("{{Your name}}, {{Your phone}}, date");

        String title = switch (kind) {
            case L1_BRANCH -> "Letter to your branch";
            case L2_OFFICER -> "Letter to the police officer";
            case L3_REVIEW, L3_DISTRICT -> "Request for review";
            case L4_BACKSTOP -> "90-day request to your branch";
            case L5_LAWYER_NOTES -> "Notes for your lawyer or legal aid";
        };
        return new Draft(title, "The Branch Manager, " + bank,
                "Request to release my frozen balance", body.toString(), citations,
                List.of("Evidence pack"));
    }

    /** The first complete sentence of the chunk: short, exact, so the quote check passes by construction. */
    static String firstSentence(String text) {
        if (text == null) {
            return null;
        }
        String clean = text.trim().replaceAll("\\s+", " ");
        int end = clean.length();
        for (char mark : new char[]{'.', '!', '?'}) {
            int at = clean.indexOf(mark);
            if (at > 20 && at < end) {
                end = at + 1;
                break;
            }
        }
        String sentence = clean.substring(0, end).trim();
        return sentence.length() >= 20 ? sentence : clean;
    }

    private static String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String firstUtr(Map<String, Object> facts) {
        Object payments = facts.get("disputedPayments");
        if (payments instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> p) {
            return str(p.get("utr"));
        }
        return "";
    }
}
