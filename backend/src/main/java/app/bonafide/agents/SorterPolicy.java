package app.bonafide.agents;

import app.bonafide.agents.outputs.SorterOutput;
import java.util.List;
import java.util.Map;

/**
 * Plain-code mapping from the Sorter's verdict to what happens next (BUILD_SPEC §10.3).
 * Referral texts are fixed strings here, never written by an LLM.
 */
public final class SorterPolicy {

    public static final Map<String, Object> DLSA_REFERRAL = Map.of(
            "to", "DLSA",
            "title", "Free legal aid",
            "text", "Because someone else used your account, we can't write letters for you; this needs a lawyer. "
                    + "Your District Legal Services Authority (DLSA) gives free legal aid to women, SC/ST people, "
                    + "disabled people and anyone under the state's income limit (₹3 lakh in most states). "
                    + "You can apply online or at your district court.",
            "link", "https://nalsa.gov.in/legal-aid/");

    public static final Map<String, Object> COURT_REFERRAL = Map.of(
            "to", "LAWYER",
            "title", "Free legal aid at the court step",
            "text", "The police and the District Grievance Officer did not release the money, so the next step "
                    + "needs a lawyer or free legal aid. Take the notes we prepared with you. These are notes, "
                    + "not a court petition. Under the Legal Services Authorities Act, 1987, you can get free "
                    + "legal counsel from the government.",
            "link", "https://nalsa.gov.in/legal-aid/");

    public static final Map<String, Object> VICTIM_REFERRAL = Map.of(
            "to", "CYBER_HELPLINE",
            "title", "Report the fraud",
            "text", "You were the victim of the fraud itself, not someone whose account was wrongly frozen. "
                    + "Call 1930 or report it at cybercrime.gov.in.",
            "link", "https://cybercrime.gov.in");

    private SorterPolicy() {
    }

    public enum Verdict {
        CONTINUE,
        NEEDS_ANSWERS,
        REFERRED_DLSA,
        REFERRED_VICTIM,
        NEEDS_LAWYER
    }

    public record Decision(Verdict verdict, List<String> cautions, Map<String, Object> referral) {

        public static Decision continueOn(List<String> cautions) {
            return new Decision(Verdict.CONTINUE, cautions, null);
        }
    }

    public static Decision decide(SorterOutput sorter, boolean questionsAlreadyAsked) {
        String status = sorter.status() == null ? "UNCLEAR" : sorter.status();
        if ("LENT_ACCOUNT".equals(status)) {
            return new Decision(Verdict.REFERRED_DLSA, List.of(), DLSA_REFERRAL);
        }
        if ("VICTIM".equals(status)) {
            return new Decision(Verdict.REFERRED_VICTIM, List.of(), VICTIM_REFERRAL);
        }
        if (sorter.accused()) {
            return new Decision(Verdict.NEEDS_LAWYER, List.of(), DLSA_REFERRAL);
        }
        if ("UNCLEAR".equals(status)) {
            if (!questionsAlreadyAsked && hasQuestions(sorter)) {
                return new Decision(Verdict.NEEDS_ANSWERS, List.of(), null);
            }
            return Decision.continueOn(List.of(
                    "Talk to free legal aid if unsure whether your case qualifies."));
        }
        return Decision.continueOn(cryptoCaution(sorter));
    }

    private static boolean hasQuestions(SorterOutput sorter) {
        return sorter.questions() != null && !sorter.questions().isEmpty();
    }

    private static List<String> cryptoCaution(SorterOutput sorter) {
        if ("CRYPTO_P2P".equals(sorter.caseType())) {
            return List.of("Get legal advice about P2P trading itself; the rules there are still unclear.");
        }
        return List.of();
    }
}
