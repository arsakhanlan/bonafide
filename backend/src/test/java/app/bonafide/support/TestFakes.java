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

    public static class InMemoryCaseRepository implements CaseRepository {
        public final Map<String, Case> cases = new ConcurrentHashMap<>();

        @Override
        public Optional<Case> find(String caseId) {
            return Optional.ofNullable(cases.get(caseId));
        }

        @Override
        public void save(Case case_) {
            cases.put(case_.id(), case_);
        }

        @Override
        public void setBusy(String caseId, boolean busy) {
            cases.computeIfPresent(caseId, (id, c) -> new Case(c.id(), c.uid(), c.language(), c.stage(), busy,
                    c.title(), c.createdAt(), c.updatedAt(), c.facts(), c.questions(), c.eligibility(), c.money(),
                    c.evidence(), c.plan(), c.nextStep(), c.referral(), c.history(), c.demo()));
        }

        @Override
        public void updateStageNextStep(String caseId, Stage stage, Map<String, Object> nextStep) {
            cases.computeIfPresent(caseId, (id, c) -> new Case(c.id(), c.uid(), c.language(), stage, c.busy(),
                    c.title(), c.createdAt(), c.updatedAt(), c.facts(), c.questions(), c.eligibility(), c.money(),
                    c.evidence(), c.plan(), nextStep, c.referral(), c.history(), c.demo()));
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
