package app.bonafide.rules;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class RuleLoaderTest {

    @Test
    void cleaningRemovesPageMarkersAndJoinsHyphenatedBreaks() {
        String dirty = "=== PAGE 39 ===\nPage 38 of 98\nhold the dis-\nputed amount\n\n\nmore text";
        assertThat(RuleLoader.clean(dirty)).isEqualTo("hold the disputed amount\n\nmore text");
    }

    @Test
    void sopTextSplitsByClauseAndLetteredSubClause() {
        String text = """
                9.1 Measures to be taken by Banks:
                The bank shall hold only the reported amount.
                (i) where the amount is reported, the bank shall
                9.2 Next clause text
                """;
        List<RuleChunk> chunks = RuleLoader.split("sop", "IN_FORCE", "2026-01-02", "https://example.gov.in/sop", text);
        assertThat(chunks).extracting(RuleChunk::ref)
                .containsExactly("clause 9.1", "clause 9.1(i)", "clause 9.2");
        assertThat(chunks.getFirst().text()).contains("hold only the reported amount");
    }

    @Test
    void statuteTextSplitsBySection() {
        String text = """
                106. (1) Any police officer may seize any property
                107. (1) Attachment can only be ordered by the Magistrate
                """;
        List<RuleChunk> chunks = RuleLoader.split("bnss", "IN_FORCE", "2023-12-25", "https://example.gov.in/bnss", text);
        assertThat(chunks).extracting(RuleChunk::ref)
                .containsExactly("section 106(1)", "section 107(1)");
    }

    @Test
    void longChunksGetParts() {
        String longText = "x ".repeat(1500);
        List<RuleChunk> chunks = RuleLoader.split("doc", "IN_FORCE", "2026-01-01", null, longText);
        assertThat(chunks).hasSizeGreaterThan(1);
        assertThat(chunks.getLast().ref()).contains("part");
        for (RuleChunk chunk : chunks) {
            assertThat(chunk.text().length()).isLessThanOrEqualTo(1200);
        }
    }

    @Test
    void chunkIdsAreDeterministicSoRerunsReplace() {
        RuleChunk chunk = new RuleChunk("mha-sop-2026", "clause 10.1(a)", "text", "IN_FORCE", "2026-01-02", "https://example.gov.in/sop");
        assertThat(chunk.id()).isEqualTo("mha-sop-2026-clause-10-1-a");
    }
}
