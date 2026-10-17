package app.bonafide.deadlines;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.cases.Case;
import app.bonafide.deadlines.Deadline.Status;
import app.bonafide.events.EventDispatcher;
import app.bonafide.support.TestFakes.InMemoryCaseRepository;
import app.bonafide.support.TestFakes.InMemoryDeadlineStore;
import app.bonafide.support.TestFakes.InMemoryEventRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TickServiceTest {

    private final InMemoryCaseRepository cases = new InMemoryCaseRepository();
    private final InMemoryEventRepository events = new InMemoryEventRepository(cases);
    private final InMemoryDeadlineStore deadlines = new InMemoryDeadlineStore();
    private final List<String> dispatched = new ArrayList<>();
    private final EventDispatcher dispatcher = (caseId, eventId) -> dispatched.add(caseId + "/" + eventId);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-27T00:00:00Z"), ZoneId.of("Asia/Kolkata"));

    private TickService tick;

    @BeforeEach
    void setUp() {
        dispatched.clear();
        tick = new TickService(deadlines, events, dispatcher, clock);
        cases.save(Case.newCase("c1", "u1", "en", clock.instant(), null));
        deadlines.put("c1", new Deadline("BANK_FILE_GRIEVANCE", "BANK", "Bank files your grievance",
                LocalDate.of(2026, 10, 19), LocalDate.of(2026, 10, 26), Status.PENDING,
                "MHA SOP, clause 10.1(a)", false, "c1", "u1"));
    }

    @Test
    void aMissedDeadlineWakesOneIdempotentEvent() {
        int woken = tick.tick(LocalDate.of(2026, 10, 27), false);
        assertThat(woken).isEqualTo(1);
        assertThat(deadlines.findAll("c1").getFirst().status()).isEqualTo(Status.MISSED);
        assertThat(events.events).containsKey("c1/dl-BANK_FILE_GRIEVANCE");
        assertThat(dispatched).containsExactly("c1/dl-BANK_FILE_GRIEVANCE");

        // The same tick again wakes nothing: the id is taken and the status is no longer PENDING.
        int again = tick.tick(LocalDate.of(2026, 10, 27), false);
        assertThat(again).isZero();
    }

    @Test
    void demoDeadlinesNeverFireFromTheRealTick() {
        cases.save(Case.newCase("c2", "u1", "en", clock.instant(), null));
        deadlines.put("c2", new Deadline("BANK_FILE_GRIEVANCE", "BANK", "Bank files your grievance",
                LocalDate.of(2026, 10, 19), LocalDate.of(2026, 10, 26), Status.PENDING,
                "MHA SOP, clause 10.1(a)", true, "c2", "u1"));
        // The real case c1 wakes; the demo case c2 must not.
        assertThat(tick.tick(LocalDate.of(2026, 10, 27), false)).isEqualTo(1);
        assertThat(events.events).containsKey("c1/dl-BANK_FILE_GRIEVANCE");
        assertThat(events.events).doesNotContainKey("c2/dl-BANK_FILE_GRIEVANCE");
    }

    @Test
    void checkCaseWakesDemoDeadlinesWithThePretendToday() {
        cases.save(Case.newCase("c2", "u1", "en", clock.instant(), null));
        deadlines.put("c2", new Deadline("BANK_FILE_GRIEVANCE", "BANK", "Bank files your grievance",
                LocalDate.of(2026, 10, 19), LocalDate.of(2026, 10, 26), Status.PENDING,
                "MHA SOP, clause 10.1(a)", true, "c2", "u1"));
        assertThat(tick.checkCase("c2", LocalDate.of(2026, 10, 27))).isEqualTo(1);
        assertThat(events.events).containsKey("c2/dl-BANK_FILE_GRIEVANCE");
    }

    @Test
    void aDueDateCountsAsTheEndOfThatDay() {
        assertThat(tick.tick(LocalDate.of(2026, 10, 26), false)).isZero();
        assertThat(deadlines.findAll("c1").getFirst().status()).isEqualTo(Status.PENDING);
    }
}
