package app.bonafide.rules;

import java.util.List;
import java.util.Optional;

/** Port over the Firestore rule_chunks collection. */
public interface RuleRepository {

    /** Removes every chunk, so a reload starts clean (chunk ids are deterministic). */
    void clear();

    void save(RuleChunk chunk, double[] vector);

    /** Top-N chunks by cosine distance, IN_FORCE only (pre-filter). */
    List<RuleChunk> findNearest(double[] queryVector, int limit);

    /** An exact ref lookup (the rule-map must-includes), any status. */
    Optional<RuleChunk> findByRef(String ref);

    Optional<RuleChunk> findById(String chunkId);
}
