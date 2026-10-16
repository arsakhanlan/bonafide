package app.bonafide.trace;

import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** A step is written as RUNNING and then updated in the same document (contract §5.4). */
@Component
@Profile("!test")
public class FirestoreStepWriter implements StepWriter {

    private final Firestore firestore;

    public FirestoreStepWriter(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public String write(String caseId, String agent, String text, String status) {
        String stepId = "s_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> step = new HashMap<>();
        step.put("at", FieldValue.serverTimestamp());
        step.put("agent", agent);
        step.put("text", text);
        step.put("status", status);
        step.put("ms", null);
        try {
            firestore.collection("cases").document(caseId).collection("steps").document(stepId).set(step).get();
        } catch (Exception e) {
            throw new IllegalStateException("Writing a step on " + caseId + " failed", e);
        }
        return stepId;
    }

    @Override
    public void update(String caseId, String stepId, String text, String status, Long ms) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("text", text);
        fields.put("status", status);
        fields.put("at", FieldValue.serverTimestamp());
        fields.put("ms", ms);
        try {
            firestore.collection("cases").document(caseId).collection("steps").document(stepId).update(fields).get();
        } catch (Exception e) {
            throw new IllegalStateException("Updating step " + stepId + " failed", e);
        }
    }
}
