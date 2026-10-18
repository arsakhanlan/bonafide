package app.bonafide.rules;

import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Filter;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.VectorQuery;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class FirestoreRuleRepository implements RuleRepository {

    private final Firestore firestore;

    public FirestoreRuleRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public void clear() {
        try {
            firestore.recursiveDelete(firestore.collection("rule_chunks")).get();
        } catch (Exception e) {
            throw new IllegalStateException("Clearing rule_chunks failed", e);
        }
    }

    @Override
    public void save(RuleChunk chunk, double[] vector) {
        Map<String, Object> data = new HashMap<>();
        data.put("docId", chunk.docId());
        data.put("ref", chunk.ref());
        data.put("text", chunk.text());
        data.put("status", chunk.status());
        data.put("date", chunk.date());
        data.put("sourceUrl", chunk.sourceUrl());
        data.put("embedding", FieldValue.vector(vector));
        try {
            firestore.collection("rule_chunks").document(chunk.id()).set(data).get();
        } catch (Exception e) {
            throw new IllegalStateException("Saving chunk " + chunk.id() + " failed", e);
        }
    }

    @Override
    public List<RuleChunk> findNearest(double[] queryVector, int limit) {
        // The IN_FORCE pre-filter sits on the query before findNearest (needs the composite index).
        VectorQuery query = firestore.collection("rule_chunks")
                .where(Filter.equalTo("status", "IN_FORCE"))
                .findNearest("embedding", queryVector, limit, VectorQuery.DistanceMeasure.COSINE);
        List<RuleChunk> chunks = new ArrayList<>();
        try {
            for (var snapshot : query.get().get().getDocuments()) {
                chunks.add(new RuleChunk(
                        (String) snapshot.get("docId"),
                        (String) snapshot.get("ref"),
                        (String) snapshot.get("text"),
                        (String) snapshot.get("status"),
                        (String) snapshot.get("date"),
                        (String) snapshot.get("sourceUrl")));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Vector search failed", e);
        }
        return chunks;
    }

    @Override
    public Optional<RuleChunk> findById(String chunkId) {
        try {
            var snapshot = firestore.collection("rule_chunks").document(chunkId).get().get();
            if (!snapshot.exists()) {
                return Optional.empty();
            }
            return Optional.of(new RuleChunk(
                    (String) snapshot.get("docId"),
                    (String) snapshot.get("ref"),
                    (String) snapshot.get("text"),
                    (String) snapshot.get("status"),
                    (String) snapshot.get("date"),
                    (String) snapshot.get("sourceUrl")));
        } catch (Exception e) {
            throw new IllegalStateException("Chunk lookup failed", e);
        }
    }

    @Override
    public Optional<RuleChunk> findByRef(String ref) {
        try {
            var snapshots = firestore.collection("rule_chunks")
                    .where(Filter.equalTo("ref", ref)).limit(1).get().get().getDocuments();
            if (snapshots.isEmpty()) {
                return Optional.empty();
            }
            var snapshot = snapshots.getFirst();
            return Optional.of(new RuleChunk(
                    (String) snapshot.get("docId"),
                    (String) snapshot.get("ref"),
                    (String) snapshot.get("text"),
                    (String) snapshot.get("status"),
                    (String) snapshot.get("date"),
                    (String) snapshot.get("sourceUrl")));
        } catch (Exception e) {
            throw new IllegalStateException("Ref lookup failed", e);
        }
    }

    @Override
    public Optional<RuleChunk> findByRefContaining(String refPart) {
        try {
            for (var snapshot : firestore.collection("rule_chunks").get().get().getDocuments()) {
                String ref = (String) snapshot.get("ref");
                if (ref != null && ref.contains(refPart)) {
                    return Optional.of(new RuleChunk(
                            (String) snapshot.get("docId"),
                            ref,
                            (String) snapshot.get("text"),
                            (String) snapshot.get("status"),
                            (String) snapshot.get("date"),
                            (String) snapshot.get("sourceUrl")));
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            throw new IllegalStateException("Ref lookup failed", e);
        }
    }
}
