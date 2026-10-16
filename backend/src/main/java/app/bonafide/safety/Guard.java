package app.bonafide.safety;

import java.util.List;

/** Checks text taken from papers for instructions aimed at the AI (prompt injection). */
public interface Guard {

    GuardResult check(String text);

    record GuardResult(boolean flagged, List<String> reasons) {

        public static GuardResult clean() {
            return new GuardResult(false, List.of());
        }
    }
}
