package app.bonafide.letters;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.outputs.Draft;
import app.bonafide.agents.outputs.Draft.Citation;
import app.bonafide.rules.RuleChunk;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
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
    void theSafeLetterPassesItsOwnChecks() {
        Draft safe = SafeLetter.build(LetterKind.L1_BRANCH, context);
        DraftChecker.CheckResult result = checker.evaluate(safe, context);
        assertThat(result.problems()).as("problems: %s", result.problems()).isEmpty();
        assertThat(result.passed()).isTrue();
        assertThat(safe.citations()).isNotEmpty();
    }

    @Test
    void everyKindOfSafeLetterPassesItsOwnChecks() {
        for (LetterKind kind : List.of(
                LetterKind.L1_BRANCH, LetterKind.L2_OFFICER, LetterKind.L3_REVIEW,
                LetterKind.L3_DISTRICT, LetterKind.L4_BACKSTOP, LetterKind.L5_LAWYER_NOTES)) {
            CheckContext kindContext = new CheckContext(
                    new LetterCatalog().get(kind), List.of(RULE),
                    new BigDecimal("2000"), new BigDecimal("180000"), new BigDecimal("178000"), 0.6,
                    context.facts(), context.evidence(), context.personNote());
            Draft safe = SafeLetter.build(kind, kindContext);
            DraftChecker.CheckResult result = checker.evaluate(safe, kindContext);
            assertThat(result.problems()).as(kind + " problems: %s", result.problems()).isEmpty();
            assertThat(result.passed()).as(kind + " passed").isTrue();
            assertThat(safe.citations()).as(kind + " citations").isNotEmpty();
        }
    }

    @Test
    void aDraftWithoutTheRequiredCitationFails() {
        Draft noCitation = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace(" [1]", ""), List.of(), goodDraft().attachments());
        assertThat(checker.evaluate(noCitation, context).problems())
                .anyMatch(p -> p.contains("must quote and cite clause 10.1(a)"));
    }

    @Test
    void aDifferentLibraryRefStillNeedsOneCitation() {
        RuleChunk tenTwo = new RuleChunk(
                RULE.id(), "clause 10.2", RULE.text(), RULE.status(), RULE.date(), RULE.sourceUrl());
        CheckContext otherRef = new CheckContext(
                new LetterCatalog().get(LetterKind.L1_BRANCH), List.of(tenTwo),
                new BigDecimal("2000"), new BigDecimal("180000"), new BigDecimal("178000"), 0.6,
                context.facts(), context.evidence(), context.personNote());

        Draft cited = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body(),
                List.of(new Citation(1, tenTwo.id(), "file the grievance within 7 days")),
                goodDraft().attachments());
        DraftChecker.CheckResult draftResult = checker.evaluate(cited, otherRef);
        assertThat(draftResult.problems()).as("problems: %s", draftResult.problems()).isEmpty();

        Draft noCitation = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace(" [1]", ""), List.of(), goodDraft().attachments());
        assertThat(checker.evaluate(noCitation, otherRef).problems())
                .anyMatch(p -> p.contains("at least one rule"));
    }

    @Test
    void aPrefixedRuleRefStillSatisfiesTheMustIncludeAndTheSafeLetter() {
        RuleChunk prefixed = new RuleChunk(
                RULE.id(), "MHA SOP (2 Jan 2026), clause 10.1(a)", RULE.text(),
                RULE.status(), RULE.date(), RULE.sourceUrl());
        CheckContext prefixedContext = new CheckContext(
                new LetterCatalog().get(LetterKind.L1_BRANCH), List.of(prefixed),
                new BigDecimal("2000"), new BigDecimal("180000"), new BigDecimal("178000"), 0.6,
                context.facts(), context.evidence(), context.personNote());

        Draft safe = SafeLetter.build(LetterKind.L1_BRANCH, prefixedContext);

        assertThat(safe.citations()).isNotEmpty();
        assertThat(checker.evaluate(safe, prefixedContext).passed()).isTrue();
    }

    @Test
    void groundingIsSkippedWhenACodeCheckAlreadyFailed() {
        AtomicInteger calls = new AtomicInteger();
        DraftChecker counter = new DraftChecker((answer, facts, threshold) -> {
            calls.incrementAndGet();
            return 0.9f;
        }, properties(), new LetterCatalog());
        Draft wrongAmount = new Draft(goodDraft().title(), goodDraft().to(), goodDraft().subject(),
                goodDraft().body().replace("₹1,78,000", "₹1,79,000"), goodDraft().citations(),
                goodDraft().attachments());

        assertThat(counter.evaluate(wrongAmount, context).passed()).isFalse();
        assertThat(calls).hasValue(0);
    }

    @Test
    void groundingOfTheSameDraftIsCached() {
        AtomicInteger calls = new AtomicInteger();
        DraftChecker counter = new DraftChecker((answer, facts, threshold) -> {
            calls.incrementAndGet();
            return 0.9f;
        }, properties(), new LetterCatalog());

        counter.evaluate(goodDraft(), context);
        counter.evaluate(goodDraft(), context);

        assertThat(calls).hasValue(1);
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
