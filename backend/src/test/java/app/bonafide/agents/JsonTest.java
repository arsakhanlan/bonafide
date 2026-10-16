package app.bonafide.agents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import app.bonafide.agents.outputs.ReaderOutput;
import java.util.List;
import org.junit.jupiter.api.Test;

class JsonTest {

    @Test
    void stripsCodeFencesBeforeParsing() {
        String fenced = """
                ```json
                {"personNote": "I sold a phone", "unsure": ["officer"]}
                ```
                """;
        ReaderOutput output = Json.parse(fenced, ReaderOutput.class);
        assertThat(output.personNote()).isEqualTo("I sold a phone");
        assertThat(output.unsure()).containsExactly("officer");
    }

    @Test
    void ignoresUnknownFieldsTheModelAdds() {
        String withExtra = """
                {"personNote": "hi", "unsure": [], "facts": {"bank": "Demo Bank", "freezeType": "WHOLE_ACCOUNT"},
                 "documents": [], "statementLines": [], "extraField": 42}
                """;
        ReaderOutput output = Json.parse(withExtra, ReaderOutput.class);
        assertThat(output.facts().bank()).isEqualTo("Demo Bank");
        assertThat(output.facts().freezeType()).isEqualTo("WHOLE_ACCOUNT");
    }

    @Test
    void parsesAFullReaderOutput() {
        String full = """
                {
                  "documents": [{"docId": "doc1", "kind": "NOTICE", "readOk": true,
                    "summary": "Freeze SMS", "quotes": [{"text": "account frozen", "page": "1"}]}],
                  "facts": {"bank": "Demo Bank", "freezeType": "WHOLE_ACCOUNT", "freezeOn": "2026-10-16",
                    "balanceOnFreeze": "180000", "complaintNo": "31210260054321",
                    "policeStation": "Cyber Police Station, Patna", "digitalBankingBlocked": false,
                    "futureCreditHold": false, "layer": 1,
                    "disputedPayments": [{"utr": "601234567890", "on": "2026-10-15", "amount": "2000", "from": "UPI customer"}]},
                  "statementLines": [{"on": "2026-10-15", "amount": "2000", "direction": "CREDIT",
                    "utr": "601234567890", "party": "UPI", "balanceAfter": "180000"}],
                  "personNote": "A customer paid for a repair.", "unsure": [],
                  "milestone": null, "milestoneOn": null, "replySummary": null
                }
                """;
        ReaderOutput output = Json.parse(full, ReaderOutput.class);
        assertThat(output.facts().balanceOnFreeze()).isEqualTo("180000");
        assertThat(output.facts().disputedPayments().getFirst().utr()).isEqualTo("601234567890");
        assertThat(output.statementLines().getFirst().direction()).isEqualTo("CREDIT");
        assertThat(output.documents().getFirst().quotes().getFirst().text()).isEqualTo("account frozen");
    }

    @Test
    void badJsonIsRejectedLoudly() {
        assertThatThrownBy(() -> Json.parse("not json at all", ReaderOutput.class))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void emptyStringIsNotValidJson() {
        assertThatThrownBy(() -> Json.parse("", ReaderOutput.class))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void listTypesParseFromJsonArrays() {
        List<String> unsure = Json.parse("{\"unsure\": [\"a\", \"b\"], \"documents\": []}", ReaderOutput.class).unsure();
        assertThat(unsure).containsExactly("a", "b");
    }
}
