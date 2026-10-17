package app.bonafide.letters;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.outputs.Draft;
import app.bonafide.agents.outputs.Draft.Citation;
import app.bonafide.rules.RuleChunk;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DraftCheckerTest {

    private static final RuleChunk RULE = new RuleChunk(
            "mha-sop-2026", "clause 10.1(a)", "the bank shall file the grievance within 7 days",
            "IN_FORCE", "2026-01-02", "https://example.gov.in/sop");

    private final Grounding grounding = (answer, facts, threshold) -> 0.9f;
    private final DraftChecker checker = new DraftChecker(
            grounding, properties(), new LetterCatalog());
    private final CheckContext context = new CheckContext(
            new LetterCatalog().get(LetterKind.L1_BRANCH),
            List.of(RULE),
            new BigDecimal("2000"), new BigDecimal("180000"), new BigDecimal("178000"), 0.6,
            java.util.Map.of(
                    "bank", "Demo Bank", "branch", "FC Road, Pune", "accountLast4", "4821",
                    "freezeType", "WHOLE_ACCOUNT", "freezeOn", "2026-10-16",
                    "complaintNo", "31210260054321", "policeStation", "Cyber Police Station, Patna",
                    "officer", "", "disputedPayments", java.util.List.of(
                            java.util.Map.of("utr", "601234567890", "on", "2026-10-15", "amount", 2000.0, "from", "UPI customer"))),
            java.util.List.of(java.util.Map.of("label", "Who you are", "status", "HAVE")),
            "A customer paid for a repair.");

    private static app.bonafide.config.BonafideProperties properties() {
        return new app.bonafide.config.BonafideProperties(
                "asia-southeast1", "", "gemini-3.8-flash", "gemini-3.5-flash-lite",
                "gemini-embedding-2", "", 0.6, true, "", "", "../data/rules");
    }

    private static Draft goodDraft() {
        return new Draft(
                "Letter to your branch",
                "The Branch Manager",
                "Request to release my frozen balance",
                "My account ending ••4821 was frozen for one payment of ₹2,000 with UTR 601234567890, "
                        + "complaint 31210260054321. The frozen amount is ₹1,80,000 and ₹1,78,000 should be free. "
                        + "I offer to keep the disputed amount on hold [1]. Please share the police details "
                        + "and file my grievance within 7 days. Enclosed: Aadhaar and PAN, the repair bill. "
                        + "{{Your name}}, date",
                List.of(new Citation(1, RULE.id(), "file the grievance within 7 days")),
                List.of("Aadhaar and PAN"));
    }

    @Test
    void aCompleteDraftPasses() {
        assertThat(checker.evaluate(goodDraft(), context).passed()).isTrue();
    }

    @Test
    void aQuoteThatIsNotWordForWordFails() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body(),
                List.of(new Citation(1, RULE.id(), "file the grievance within seven days")),
                goodDraft().attachments());
        DraftChecker.CheckResult result = checker.evaluate(draft, context);
        assertThat(result.passed()).isFalse();
        assertThat(result.problems()).anyMatch(p -> p.contains("not word-for-word"));
    }

    @Test
    void aMarkerWithoutACitationFails() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace(" [1]", " [2]"), goodDraft().citations(), goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("Marker [2]"));
    }

    @Test
    void anUnusedCitationFails() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace(" [1]", ""),
                List.of(new Citation(1, RULE.id(), "file the grievance within 7 days"),
                        new Citation(2, RULE.id(), "file the grievance within 7 days")),
                goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("never used"));
    }

    @Test
    void bannedPhrasesFail() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body() + " We guarantee you will get your money back.", goodDraft().citations(),
                goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("guarantee"));
    }

    @Test
    void wrongAmountsFail() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace("₹1,78,000", "₹1,79,000"), goodDraft().citations(),
                goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("₹1,78,000"));
    }

    @Test
    void aMissingPlaceholderFails() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace("{{Your name}}, date", ""), goodDraft().citations(),
                goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("{{Your name}}"));
    }

    @Test
    void aLetterThatIsTooLongFails() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                ("word ".repeat(500)), goodDraft().citations(), goodDraft().attachments());
        assertThat(checker.evaluate(draft, context).problems()).anyMatch(p -> p.contains("too long"));
    }

    @Test
    void aLowGroundingScoreFails() {
        Grounding low = (answer, facts, threshold) -> 0.2f;
        DraftChecker strict = new DraftChecker(low, properties(), new LetterCatalog());
        assertThat(strict.evaluate(goodDraft(), context).problems()).anyMatch(p -> p.contains("grounding"));
    }

    @Test
    void citationLinksAreFilteredToOfficialDomains() {
        assertThat(LetterService.allowedLink("https://the420.in/wp-content/uploads/sop.pdf")).isEmpty();
        assertThat(LetterService.allowedLink("https://mha.gov.in/sop")).isEqualTo("https://mha.gov.in/sop");
        assertThat(LetterService.allowedLink("https://nalsa.gov.in/legal-aid/")).isEqualTo("https://nalsa.gov.in/legal-aid/");
        assertThat(LetterService.allowedLink("https://cybercrime.gov.in")).isEqualTo("https://cybercrime.gov.in");
        assertThat(LetterService.allowedLink(null)).isEmpty();
    }

    @Test
    void failingCitationsAreRemovedWithTheirMarkers() {
        Draft draft = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace(" [1]", " [1] [2]"),
                List.of(new Citation(1, RULE.id(), "file the grievance within 7 days"),
                        new Citation(2, RULE.id(), "made up quote")),
                goodDraft().attachments());
        Draft cleaned = LetterService.removeFailingCitations(draft, context);
        assertThat(cleaned.citations()).hasSize(1);
        assertThat(cleaned.body()).doesNotContain("[2]");
        assertThat(cleaned.body()).contains("[1]");
    }
}
