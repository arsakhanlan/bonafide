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

        StringBuilder body = new StringBuilder();
        if (kind == LetterKind.L5_LAWYER_NOTES) {
            body.append("Notes for my lawyer or free legal aid.\n\n");
            body.append("Timeline: my account ending ••").append(last4)
                    .append(" with ").append(bank.isBlank() ? "my bank" : bank)
                    .append(" was frozen on ").append(orUnknown(freezeOn, "the date in the enclosed notice"))
                    .append(". Amounts: frozen ").append(frozen)
                    .append(", disputed ").append(disputed)
                    .append(", should be released ").append(release)
                    .append(". Rules and court rulings with references: the enclosed rule extracts set out the law. ")
                    .append("What has been tried: I sent letters to the bank and the police. ")
                    .append("Open deadlines: the deadlines in my case are still due. ")
                    .append("These are notes, not a petition. ");
        } else {
            body.append("My account ending ••").append(last4)
                    .append(" with ").append(bank.isBlank() ? "my bank" : bank)
                    .append(" was frozen on ").append(orUnknown(freezeOn, "the date in the enclosed notice"))
                    .append(". The complaint number is ")
                    .append(complaint.isBlank() ? "not known to me" : complaint)
                    .append(" from ").append(station.isBlank() ? "the police station in the complaint" : station)
                    .append(". The disputed payment is UTR ")
                    .append(utr.isBlank() ? "not known to me" : utr)
                    .append(" of ").append(disputed)
                    .append(". The frozen amount is ").append(frozen)
                    .append(" and ").append(release).append(" should be released. ");
            switch (kind) {
                case L1_BRANCH -> body.append(
                        "I offer to keep the disputed amount on hold. Please share the police details and "
                                + "file my grievance on the grievance module within 7 days. Enclosed: the evidence. ");
                case L4_BACKSTOP -> body.append(
                        "I filed my grievance on ").append(orUnknown(freezeOn, "the date in the enclosed notice"))
                        .append(". 90 calendar days have passed with no lawful direction. Please remove the "
                                + "hold under the 90-day paragraph of clause 10.1. Enclosed: the evidence. ");
                case L2_OFFICER -> body.append(
                        "I offer to keep the disputed amount on hold. Please verify my grievance, preferably "
                                + "through a video-call check. If you decide not to release the money, please give "
                                + "me your written reasons for refusing. Enclosed: the evidence. ");
                case L3_REVIEW -> body.append(
                        "You refused to release the money on ").append(orUnknown(freezeOn, "the date in the notice"))
                        .append(". Your reasons are noted; my answer to each reason is the evidence enclosed. "
                                + "Please review this within 15 days under clause 10.1(f). Enclosed: the evidence. ");
                case L3_DISTRICT -> body.append(
                        "I filed my grievance on ").append(orUnknown(freezeOn, "the date in the enclosed notice"))
                        .append(". There has been no decision within 15 calendar days. Under clause 10.1(f), "
                                + "the case moves automatically to you. Please decide within 15 days. "
                                + "Enclosed: the evidence. ");
                case L5_LAWYER_NOTES -> {
                }
            }
        }

        List<RuleChunk> cite = new ArrayList<>();
        for (RuleChunk chunk : context.chunks()) {
            if (kind == LetterKind.L5_LAWYER_NOTES
                    || context.spec().mustIncludeRefs().stream().anyMatch(chunk.ref()::contains)) {
                cite.add(chunk);
            }
        }
        if (cite.isEmpty() && !context.chunks().isEmpty()) {
            // The exact must-include ref is absent from the library; still cite one real rule.
            cite.add(context.chunks().getFirst());
        }
        List<Citation> citations = new ArrayList<>();
        int n = 1;
        for (RuleChunk chunk : cite) {
            String sentence = firstSentence(chunk.text());
            if (sentence != null) {
                body.append(kind == LetterKind.L5_LAWYER_NOTES ? "Rule extract: \"" : "The rules say: \"")
                        .append(sentence).append("\" [").append(n).append("]. ");
                citations.add(new Citation(n, chunk.id(), sentence));
                n++;
            }
        }
        body.append("{{Your name}}, {{Your phone}}, date");

        String to = switch (kind) {
            case L1_BRANCH, L4_BACKSTOP -> "The Branch Manager, " + bank;
            case L2_OFFICER -> "The Investigating Officer, " + (station.isBlank() ? "the police station" : station);
            case L3_REVIEW, L3_DISTRICT -> "The District Grievance Officer";
            case L5_LAWYER_NOTES -> "My lawyer or free legal aid";
        };
        String subject = switch (kind) {
            case L1_BRANCH, L4_BACKSTOP -> "Request to release my frozen balance";
            case L2_OFFICER -> "Request to release the hold on my account";
            case L3_REVIEW, L3_DISTRICT -> "Request for a review of the hold on my account";
            case L5_LAWYER_NOTES -> "Notes for my lawyer or free legal aid";
        };
        return new Draft(context.spec().title(), to, subject, body.toString(), citations,
                List.of("Evidence pack"));
    }

    private static String orUnknown(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
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
