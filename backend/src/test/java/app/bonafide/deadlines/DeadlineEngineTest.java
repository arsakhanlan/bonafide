package app.bonafide.deadlines;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.deadlines.Deadline.Status;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The 12 spec cases from BUILD_SPEC §12. */
class DeadlineEngineTest {

    private static class InMemoryStore implements DeadlineStore {
        final Map<String, Map<String, Deadline>> byCase = new ConcurrentHashMap<>();

        @Override
        public void put(String caseId, Deadline deadline) {
            byCase.computeIfAbsent(caseId, k -> new ConcurrentHashMap<>()).put(deadline.clock(), deadline);
        }

        @Override
        public List<Deadline> findAll(String caseId) {
            return new ArrayList<>(byCase.getOrDefault(caseId, Map.of()).values());
        }

        @Override
        public void markStatus(String caseId, String clock, Status status) {
            byCase.computeIfPresent(caseId, (k, deadlines) -> {
                Deadline current = deadlines.get(clock);
                if (current == null) {
                    return deadlines;
                }
                deadlines.put(clock, new Deadline(current.clock(), current.who(), current.title(),
                        current.startOn(), current.dueOn(), status, current.ruleRef(),
                        current.demo(), current.caseId(), current.uid()));
                return deadlines;
            });
        }

        @Override
        public List<Deadline> findMissed(LocalDate today) {
            return byCase.values().stream()
                    .flatMap(deadlines -> deadlines.values().stream())
                    .filter(d -> d.status() == Status.PENDING && today.isAfter(d.dueOn()))
                    .toList();
        }
    }

    private final InMemoryStore store = new InMemoryStore();
    private final DeadlineEngine engine = new DeadlineEngine(store, new ClockCatalog());

    @BeforeEach
    void startRavisClock() {
        engine.start("c1", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 10, 19), false);
    }

    @Test
    void bankGrievanceIsSevenDaysLater() {
        assertThat(store.findAll("c1")).extracting(Deadline::dueOn).containsExactly(LocalDate.of(2026, 10, 26));
    }

    @Test
    void monthEndRollsOver() {
        engine.start("c2", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 10, 26), false);
        assertThat(store.findAll("c2")).extracting(Deadline::dueOn).containsExactly(LocalDate.of(2026, 11, 2));
    }

    @Test
    void yearEndRollsOver() {
        engine.start("c3", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 12, 28), false);
        assertThat(store.findAll("c3")).extracting(Deadline::dueOn).containsExactly(LocalDate.of(2027, 1, 4));
    }

    @Test
    void leapYearFebruary() {
        engine.start("c4", "u1", "letter:L1_BRANCH", LocalDate.of(2028, 2, 25), false);
        assertThat(store.findAll("c4")).extracting(Deadline::dueOn).containsExactly(LocalDate.of(2028, 3, 3));
    }

    @Test
    void bankFiledStartsTheOfficerAndBackstopClocks() {
        engine.apply("c1", "BANK_FILED", LocalDate.of(2026, 10, 23));

        assertThat(store.findAll("c1"))
                .extracting(d -> d.clock() + "=" + d.dueOn())
                .contains("OFFICER_DECIDE=" + LocalDate.of(2026, 11, 7),
                        "BACKSTOP_NOTIFY=" + LocalDate.of(2027, 1, 6),
                        "BACKSTOP_90=" + LocalDate.of(2027, 1, 21));
    }

    @Test
    void aLateSentMarkIsMissedAtTheNextCheck() {
        Deadline late = store.findAll("c1").getFirst();
        store.put("c5", new Deadline(late.clock(), late.who(), late.title(),
                LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 8), Status.PENDING,
                late.ruleRef(), false, "c5", "u1"));
        assertThat(engine.missed("c5", LocalDate.of(2026, 10, 9))).hasSize(1);
    }

    @Test
    void aDueDateCountsAsTheEndOfThatDayInIndiaTime() {
        // 26 Oct 23:30 IST is still 26 Oct: not missed. 27 Oct 00:10 IST (= 26 Oct 18:40 UTC) is missed.
        Deadline deadline = store.findAll("c1").getFirst();
        store.put("c6", new Deadline(deadline.clock(), deadline.who(), deadline.title(),
                LocalDate.of(2026, 10, 19), LocalDate.of(2026, 10, 26), Status.PENDING,
                deadline.ruleRef(), false, "c6", "u1"));
        assertThat(engine.missed("c6", LocalDate.of(2026, 10, 26))).isEmpty();
        assertThat(engine.missed("c6", LocalDate.of(2026, 10, 27))).hasSize(1);
    }

    @Test
    void draftRulesCreateNothing() {
        List<Deadline> started = engine.start("c7", "u1", "never", LocalDate.of(2026, 10, 19), false);
        assertThat(started).isEmpty();
    }

    @Test
    void metAndCancelledDeadlinesAreNeverMissed() {
        engine.apply("c1", "BANK_FILED", LocalDate.of(2026, 10, 23));
        // BANK_FILE_GRIEVANCE is MET; nothing else is due before 7 Nov.
        assertThat(engine.missed("c1", LocalDate.of(2026, 11, 1))).isEmpty();
        // HOLD_LIMITED cancels the officer clocks, so even at 20 Nov nothing is missed.
        engine.apply("c1", "HOLD_LIMITED", LocalDate.of(2026, 10, 28));
        assertThat(engine.missed("c1", LocalDate.of(2026, 11, 20))).isEmpty();
    }

    @Test
    void startingTheSameClockTwiceCreatesOneDeadline() {
        engine.start("c1", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 10, 19), false);
        engine.start("c1", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 10, 19), false);
        assertThat(store.findAll("c1")).hasSize(1);
    }

    @Test
    void personDeadlinesAreMarkedWhoPerson() {
        engine.start("c8", "u1", "milestone:OFFICER_NOTICE", LocalDate.of(2026, 11, 1), false);
        assertThat(store.findAll("c8")).allMatch(d -> d.who().equals("PERSON"));
    }

    @Test
    void demoCasesCarryTheDemoFlagForTheTick() {
        engine.start("c9", "u1", "letter:L1_BRANCH", LocalDate.of(2026, 10, 19), true);
        assertThat(store.findAll("c9")).allMatch(Deadline::demo);
        // The demo "skip ahead" checks with a pretend today; the real tick filters demo=false.
        assertThat(engine.missed("c9", LocalDate.of(2026, 10, 30))).hasSize(1);
    }
}
