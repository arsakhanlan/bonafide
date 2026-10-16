package app.bonafide.documents;

import com.google.cloud.firestore.Firestore;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class FirestoreDocumentRepository implements DocumentRepository {

    private final Firestore firestore;

    public FirestoreDocumentRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public void save(String caseId, String docId, Map<String, Object> document) {
        try {
            firestore.collection("cases").document(caseId).collection("documents").document(docId).set(document).get();
        } catch (Exception e) {
            throw new IllegalStateException("Saving document " + docId + " on " + caseId + " failed", e);
        }
    }

    @Override
    public List<Map<String, Object>> findByCase(String caseId) {
        List<Map<String, Object>> documents = new ArrayList<>();
        try {
            for (var snapshot : firestore.collection("cases").document(caseId)
                    .collection("documents").get().get().getDocuments()) {
                documents.add(snapshot.getData());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Reading documents on " + caseId + " failed", e);
        }
        return documents;
    }
}
