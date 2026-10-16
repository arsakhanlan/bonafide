package app.bonafide.agents;

import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import java.util.List;
import java.util.Map;

/** The Reader's output schema, so the model returns exactly the shape the code expects. */
public final class ReaderSchema {

    private ReaderSchema() {
    }

    public static Schema schema() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "documents", arrayOf(doc()),
                        "facts", facts(),
                        "statementLines", arrayOf(statementLine()),
                        "personNote", str(),
                        "unsure", arrayOf(str()),
                        "milestone", str(),
                        "milestoneOn", str(),
                        "replySummary", str()))
                .required(List.of("documents", "facts", "statementLines", "personNote", "unsure"))
                .build();
    }

    private static Schema doc() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "docId", str(),
                        "kind", str(),
                        "readOk", Schema.builder().type(new Type(Type.Known.BOOLEAN)).build(),
                        "summary", str(),
                        "transcript", str(),
                        "quotes", arrayOf(quote())))
                .required(List.of("docId", "kind", "readOk", "summary", "quotes"))
                .build();
    }

    private static Schema quote() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of("text", str(), "page", str()))
                .required(List.of("text"))
                .build();
    }

    private static Schema facts() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.ofEntries(
                        Map.entry("bank", str()),
                        Map.entry("branch", str()),
                        Map.entry("accountNumberSeen", str()),
                        Map.entry("freezeType", str()),
                        Map.entry("freezeOn", str()),
                        Map.entry("heldAmount", str()),
                        Map.entry("balanceOnFreeze", str()),
                        Map.entry("complaintNo", str()),
                        Map.entry("policeStation", str()),
                        Map.entry("officer", str()),
                        Map.entry("state", str()),
                        Map.entry("digitalBankingBlocked", bool()),
                        Map.entry("futureCreditHold", bool()),
                        Map.entry("layer", Schema.builder().type(new Type(Type.Known.INTEGER)).build()),
                        Map.entry("disputedPayments", arrayOf(disputedPayment()))))
                .required(List.of("bank", "freezeType"))
                .build();
    }

    private static Schema disputedPayment() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of("utr", str(), "on", str(), "amount", str(), "from", str()))
                .required(List.of("amount"))
                .build();
    }

    private static Schema statementLine() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "on", str(),
                        "amount", str(),
                        "direction", str(),
                        "utr", str(),
                        "party", str(),
                        "balanceAfter", str()))
                .required(List.of("on", "amount", "direction"))
                .build();
    }

    private static Schema str() {
        return Schema.builder().type(new Type(Type.Known.STRING)).build();
    }

    private static Schema bool() {
        return Schema.builder().type(new Type(Type.Known.BOOLEAN)).build();
    }

    private static Schema arrayOf(Schema items) {
        return Schema.builder().type(new Type(Type.Known.ARRAY)).items(items).build();
    }
}
