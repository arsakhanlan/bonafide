package app.bonafide.letters;

import java.util.List;

/** Port over Google Check Grounding: how well is each sentence supported by the given facts? */
public interface Grounding {

    /** Returns the support score in [0, 1]; null when grounding is unavailable. */
    Float check(String answerCandidate, List<String> facts, double citationThreshold);
}
