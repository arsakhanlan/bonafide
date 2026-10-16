package app.bonafide.agents;

import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import java.util.List;
import java.util.Map;

/** The Sorter's output schema. */
public final class SorterSchema {

    private SorterSchema() {
    }

    public static Schema schema() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "status", str(),
                        "reasons", arrayOf(str()),
                        "questions", arrayOf(question()),
                        "caseType", str(),
                        "accused", Schema.builder().type(new Type(Type.Known.BOOLEAN)).build()))
                .required(List.of("status", "reasons", "caseType", "accused"))
                .build();
    }

    private static Schema question() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of("id", str(), "text", str(), "choices", arrayOf(str())))
                .required(List.of("id", "text", "choices"))
                .build();
    }

    private static Schema str() {
        return Schema.builder().type(new Type(Type.Known.STRING)).build();
    }

    private static Schema arrayOf(Schema items) {
        return Schema.builder().type(new Type(Type.Known.ARRAY)).items(items).build();
    }
}
