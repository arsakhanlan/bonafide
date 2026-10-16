package app.bonafide.documents;

import java.util.Map;

/** Port over Firestore for the documents collection (contract §5.7). */
public interface DocumentRepository {

    void save(String caseId, String docId, Map<String, Object> document);
}
