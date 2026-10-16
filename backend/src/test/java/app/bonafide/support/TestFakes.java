package app.bonafide.support;

import static org.mockito.Mockito.mock;

import app.bonafide.cases.Case;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.Stage;
import app.bonafide.events.Event;
import app.bonafide.events.EventRepository;
import app.bonafide.events.EventStatus;
import app.bonafide.trace.StepWriter;
import com.google.firebase.auth.FirebaseAuth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

/** In-memory ports for the test profile; no network anywhere. */
@TestConfiguration
@Profile("test")
public class TestFakes {

    @Bean
    public FirebaseAuth firebaseAuth() {
        return mock(FirebaseAuth.class);
    }

    @Bean
    public InMemoryCaseRepository caseRepository() {
        return new InMemoryCaseRepository();
    }

    @Bean
    public InMemoryEventRepository eventRepository(InMemoryCaseRepository cases) {
        return new InMemoryEventRepository(cases);
    }

    @Bean
    public InMemoryStepWriter stepWriter() {
        return new InMemoryStepWriter();
    }

    @Bean
    public InMemoryFileStore fileStore() {
        return new InMemoryFileStore();
    }

    @Bean
    public InMemoryDocumentRepository documentRepository() {
        return new InMemoryDocumentRepository();
    }

    public static class InMemoryDocumentRepository implements app.bonafide.documents.DocumentRepository {
        public final Map<String, Map<String, Object>> documents = new ConcurrentHashMap<>();

        @Override
        public void save(String caseId, String docId, Map<String, Object> document) {
            documents.put(caseId + "/" + docId, document);
        }

        @Override
        public List<Map<String, Object>> findByCase(String caseId) {
            return documents.entrySet().stream()
                    .filter(e -> e.getKey().startsWith(caseId + "/"))
                    .map(Map.Entry::getValue)
                    .toList();
        }
    }

    @Bean
    public InMemoryRuleRepository ruleRepository() {
        return new InMemoryRuleRepository();
    }

    @Bean
    public InMemoryEmbedder embedder() {
        return new InMemoryEmbedder();
    }

    @Bean
    public InMemoryLetterRepository letterRepository() {
        return new InMemoryLetterRepository();
    }

    @Bean
    public FakeGrounding grounding() {
        return new FakeGrounding();
    }

    public static class InMemoryLetterRepository implements app.bonafide.letters.LetterRepository {
        public final Map<String, Map<String, Object>> letters = new ConcurrentHashMap<>();

        @Override
        public void save(String caseId, String letterId, Map<String, Object> letter) {
            letters.put(caseId + "/" + letterId, letter);
        }

        @Override
        public Optional<Map<String, Object>> find(String caseId, String letterId) {
            return Optional.ofNullable(letters.get(caseId + "/" + letterId));
        }

        @Override
        public void update(String caseId, String letterId, Map<String, Object> fields) {
            letters.computeIfPresent(caseId + "/" + letterId, (k, letter) -> {
                Map<String, Object> merged = new java.util.HashMap<>(letter);
                merged.putAll(fields);
                return merged;
            });
        }
    }

    public static class FakeGrounding implements app.bonafide.letters.Grounding {
        @Override
        public Float check(String answerCandidate, List<String> facts, double citationThreshold) {
            return 0.9f;
        }
    }

    public static class InMemoryRuleRepository implements app.bonafide.rules.RuleRepository {
        public final Map<String, app.bonafide.rules.RuleChunk> chunks = new ConcurrentHashMap<>();

        @Override
        public void save(app.bonafide.rules.RuleChunk chunk, double[] vector) {
            chunks.put(chunk.id(), chunk);
        }

        @Override
        public List<app.bonafide.rules.RuleChunk> findNearest(double[] queryVector, int limit) {
            return chunks.values().stream().limit(limit).toList();
        }

        @Override
        public Optional<app.bonafide.rules.RuleChunk> findByRef(String ref) {
            return chunks.values().stream().filter(c -> c.ref().equals(ref)).findFirst();
        }

        @Override
        public Optional<app.bonafide.rules.RuleChunk> findById(String chunkId) {
            return Optional.ofNullable(chunks.get(chunkId));
        }
    }

    public static class InMemoryEmbedder implements app.bonafide.rules.Embedder {
        @Override
        public List<Float> embed(String text) {
            return List.of(0.1f, 0.2f);
        }
    }

    public static class InMemoryCaseRepository implements CaseRepository {
        public final Map<String, Case> cases = new ConcurrentHashMap<>();
        private final Map<String, Map<String, Object>> raw = new ConcurrentHashMap<>();

        @Override
        public Optional<Case> find(String caseId) {
            return Optional.ofNullable(cases.get(caseId));
        }

        @Override
        public Optional<Map<String, Object>> findRaw(String caseId) {
            return Optional.ofNullable(raw.get(caseId));
        }

        @Override
        public void save(Case case_) {
            cases.put(case_.id(), case_);
            raw.put(case_.id(), new java.util.HashMap<>());
        }

        @Override
        public void setBusy(String caseId, boolean busy) {
            update(caseId, Map.of("busy", busy));
        }

        @Override
        public void update(String caseId, Map<String, Object> fields) {
            raw.computeIfAbsent(caseId, id -> new java.util.HashMap<>()).putAll(fields);
            cases.computeIfPresent(caseId, (id, c) -> new Case(
                    c.id(), c.uid(), c.language(),
                    fields.containsKey("stage") ? Stage.valueOf((String) fields.get("stage")) : c.stage(),
                    fields.containsKey("busy") ? Boolean.TRUE.equals(fields.get("busy")) : c.busy(),
                    fields.containsKey("title") ? (String) fields.get("title") : c.title(),
                    c.createdAt(), c.updatedAt(),
                    fields.containsKey("facts") ? asMap(fields.get("facts")) : c.facts(),
                    fields.containsKey("questions") ? asList(fields.get("questions")) : c.questions(),
                    c.eligibility(),
                    fields.containsKey("money") ? asMap(fields.get("money")) : c.money(),
                    c.evidence(),
                    fields.containsKey("plan") ? asList(fields.get("plan")) : c.plan(),
                    fields.containsKey("nextStep") ? asMap(fields.get("nextStep")) : c.nextStep(),
                    fields.containsKey("referral") ? asMap(fields.get("referral")) : c.referral(),
                    c.history(), c.demo(),
                    fields.containsKey("personNote") ? (String) fields.get("personNote") : c.personNote(),
                    fields.containsKey("answersAsked") ? Boolean.TRUE.equals(fields.get("answersAsked")) : c.answersAsked()));
        }

        @Override
        public void appendHistory(String caseId, Map<String, Object> line) {
            cases.computeIfPresent(caseId, (id, c) -> {
                List<Map<String, Object>> history = new ArrayList<>(c.history());
                history.add(line);
                return new Case(c.id(), c.uid(), c.language(), c.stage(), c.busy(), c.title(),
                        c.createdAt(), c.updatedAt(), c.facts(), c.questions(), c.eligibility(), c.money(),
                        c.evidence(), c.plan(), c.nextStep(), c.referral(), history, c.demo(),
                        c.personNote(), c.answersAsked());
            });
        }

        @SuppressWarnings("unchecked")
        private static Map<String, Object> asMap(Object value) {
            return value == null ? Map.of() : (Map<String, Object>) value;
        }

        @SuppressWarnings("unchecked")
        private static List<Map<String, Object>> asList(Object value) {
            return value == null ? List.of() : (List<Map<String, Object>>) value;
        }

        @Override
        public void deleteAll(String caseId) {
            cases.remove(caseId);
        }
    }

    public static class InMemoryEventRepository implements EventRepository {
        public final Map<String, Event> events = new ConcurrentHashMap<>();
        private final InMemoryCaseRepository cases;

        public InMemoryEventRepository(InMemoryCaseRepository cases) {
            this.cases = cases;
        }

        @Override
        public CreateResult createPendingIfFree(String caseId, String uid, Event event) {
            Case case_ = cases.cases.get(caseId);
            if (case_ == null || !case_.uid().equals(uid)) {
                return CreateResult.NOT_FOUND;
            }
            if (case_.busy()) {
                return CreateResult.BUSY;
            }
            cases.setBusy(caseId, true);
            events.put(key(caseId, event.id()), event);
            return CreateResult.CREATED;
        }

        @Override
        public Optional<Event> claim(String caseId, String eventId) {
            Event event = events.get(key(caseId, eventId));
            if (event == null || event.status() != EventStatus.PENDING) {
                return Optional.empty();
            }
            Event claimed = new Event(event.id(), event.caseId(), event.type(), event.payload(),
                    EventStatus.RUNNING, event.attempts() + 1, event.error(),
                    event.createdAt(), java.time.Instant.now(), null);
            events.put(key(caseId, eventId), claimed);
            return Optional.of(claimed);
        }

        @Override
        public void finish(String caseId, String eventId, EventStatus status, String error) {
            events.computeIfPresent(key(caseId, eventId), (k, e) ->
                    new Event(e.id(), e.caseId(), e.type(), e.payload(), status, e.attempts(), error,
                            e.createdAt(), e.startedAt(), java.time.Instant.now()));
        }

        @Override
        public void requeue(String caseId, String eventId) {
            events.computeIfPresent(key(caseId, eventId), (k, e) ->
                    new Event(e.id(), e.caseId(), e.type(), e.payload(), EventStatus.PENDING, e.attempts(),
                            e.error(), e.createdAt(), null, null));
        }

        private static String key(String caseId, String eventId) {
            return caseId + "/" + eventId;
        }
    }

    public static class InMemoryFileStore implements app.bonafide.documents.FileStore {
        public final Map<String, byte[]> blobs = new ConcurrentHashMap<>();

        @Override
        public byte[] read(String path) {
            byte[] content = blobs.get(path);
            if (content == null) {
                throw new IllegalArgumentException("File not found: " + path);
            }
            return content;
        }

        @Override
        public void write(String path, byte[] content, String mime) {
            blobs.put(path, content);
        }

        @Override
        public void deletePrefix(String prefix) {
            blobs.keySet().removeIf(k -> k.startsWith(prefix));
        }
    }

    public static class InMemoryStepWriter implements StepWriter {
        public final List<Map<String, String>> steps = new ArrayList<>();

        @Override
        public String write(String caseId, String agent, String text, String status) {
            String id = "s_" + steps.size();
            steps.add(Map.of("id", id, "caseId", caseId, "agent", agent, "text", text, "status", status));
            return id;
        }

        @Override
        public void update(String caseId, String stepId, String text, String status, Long ms) {
            steps.replaceAll(s -> s.get("id").equals(stepId)
                    ? Map.of("id", stepId, "caseId", caseId, "agent", s.get("agent"), "text", text, "status", status)
                    : s);
        }
    }
}
