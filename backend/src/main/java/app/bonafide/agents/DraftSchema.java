package app.bonafide.agents;

import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import java.util.List;
import java.util.Map;

/** The Writer's output schema (BUILD_SPEC §10.6). */
public final class DraftSchema {

    private DraftSchema() {
    }

    public static Schema schema() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "title", str(),
                        "to", str(),
                        "subject", str(),
                        "body", str(),
                        "citations", arrayOf(citation()),
                        "attachments", arrayOf(str())))
                .required(List.of("title", "to", "subject", "body", "citations", "attachments"))
                .build();
    }

    private static Schema citation() {
        return Schema.builder()
                .type(new Type(Type.Known.OBJECT))
                .properties(Map.of(
                        "n", Schema.builder().type(new Type(Type.Known.INTEGER)).build(),
                        "chunkId", str(),
                        "quote", str()))
                .required(List.of("n", "chunkId", "quote"))
                .build();
    }

    private static Schema str() {
        return Schema.builder().type(new Type(Type.Known.STRING)).build();
    }

    private static Schema arrayOf(Schema items) {
        return Schema.builder().type(new Type(Type.Known.ARRAY)).items(items).build();
    }
}
