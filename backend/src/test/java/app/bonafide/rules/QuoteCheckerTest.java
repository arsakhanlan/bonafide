package app.bonafide.rules;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** The 8 spec cases from BUILD_SPEC §14. */
class QuoteCheckerTest {

    @Test
    void exactMatch() {
        assertThat(QuoteChecker.contains("hold only the reported amount", "hold only the reported amount")).isTrue();
    }

    @Test
    void matchesAcrossALineBreak() {
        assertThat(QuoteChecker.contains("hold only the\nreported amount", "hold only the reported amount")).isTrue();
    }

    @Test
    void matchesAcrossAHyphenatedBreak() {
        assertThat(QuoteChecker.contains("the freeze was dis-\nproportionate", "disproportionate")).isTrue();
    }

    @Test
    void matchesCurlyQuotes() {
        assertThat(QuoteChecker.contains("The court said “bonafides of the transaction” matter",
                "\"bonafides of the transaction\"")).isTrue();
    }

    @Test
    void matchesDoubleSpacesAndOddWhitespace() {
        assertThat(QuoteChecker.contains("hold  only   the\n\treported amount", "hold only the reported amount")).isTrue();
    }

    @Test
    void oneChangedWordFails() {
        assertThat(QuoteChecker.contains("hold only the reported amount", "hold only the disputed amount")).isFalse();
    }

    @Test
    void anEllipsisInTheQuoteFails() {
        assertThat(QuoteChecker.contains("hold only the reported amount", "hold only … the amount")).isFalse();
        assertThat(QuoteChecker.contains("hold only the reported amount", "hold only ... the amount")).isFalse();
    }

    @Test
    void quoteCrossingARemovedPageHeaderStillMatches() {
        // The loader removes "=== PAGE 2 ===" lines; the quote then spans what was around it.
        String cleaned = "the bank shall hold only the reported amount";
        assertThat(QuoteChecker.contains(cleaned, "the bank shall hold only the reported amount")).isTrue();
    }

    @Test
    void caseDoesNotMatter() {
        assertThat(QuoteChecker.contains("Hold Only The Reported Amount", "hold only the reported amount")).isTrue();
    }

    @Test
    void nullsAreSafe() {
        assertThat(QuoteChecker.contains(null, "x")).isFalse();
        assertThat(QuoteChecker.contains("x", null)).isFalse();
    }
}
