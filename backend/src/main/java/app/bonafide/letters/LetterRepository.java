package app.bonafide.letters;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Port over the letters collection (contract §5.5). */
public interface LetterRepository {

    List<Map<String, Object>> findByCase(String caseId);

    void save(String caseId, String letterId, Map<String, Object> letter);

    Optional<Map<String, Object>> find(String caseId, String letterId);

    void update(String caseId, String letterId, Map<String, Object> fields);
}
