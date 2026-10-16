package app.bonafide.agents.outputs;

import java.util.List;

/** What the Sorter returns (BUILD_SPEC §10.3). Questions only when UNCLEAR and not yet asked. */
public record SorterOutput(
        String status,
        List<String> reasons,
        List<Question> questions,
        String caseType,
        boolean accused) {

    public record Question(String id, String text, List<String> choices) {
    }
}
