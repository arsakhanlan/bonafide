package app.bonafide.documents;

import com.google.cloud.firestore.Firestore;
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
}
