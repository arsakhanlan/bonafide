package app.bonafide.letters;

import com.google.cloud.firestore.Firestore;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class FirestoreLetterRepository implements LetterRepository {

    private final Firestore firestore;

    public FirestoreLetterRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public void save(String caseId, String letterId, Map<String, Object> letter) {
        try {
            firestore.collection("cases").document(caseId).collection("letters").document(letterId).set(letter).get();
        } catch (Exception e) {
            throw new IllegalStateException("Saving letter " + letterId + " failed", e);
        }
    }

    @Override
    public Optional<Map<String, Object>> find(String caseId, String letterId) {
        try {
            var snapshot = firestore.collection("cases").document(caseId)
                    .collection("letters").document(letterId).get().get();
            return snapshot.exists() ? Optional.of(snapshot.getData()) : Optional.empty();
        } catch (Exception e) {
            throw new IllegalStateException("Reading letter " + letterId + " failed", e);
        }
    }

    @Override
    public void update(String caseId, String letterId, Map<String, Object> fields) {
        try {
            firestore.collection("cases").document(caseId)
                    .collection("letters").document(letterId).update(fields).get();
        } catch (Exception e) {
            throw new IllegalStateException("Updating letter " + letterId + " failed", e);
        }
    }
}
