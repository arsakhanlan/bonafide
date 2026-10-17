package app.bonafide.agents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import app.bonafide.cases.Case;
import app.bonafide.deadlines.ClockCatalog;
import app.bonafide.deadlines.DeadlineEngine;
import app.bonafide.letters.LetterService;
import app.bonafide.support.TestFakes.InMemoryCaseRepository;
import app.bonafide.support.TestFakes.InMemoryDeadlineStore;
import app.bonafide.support.TestFakes.InMemoryLetterRepository;
import app.bonafide.support.TestFakes.InMemoryStepWriter;
import com.google.adk.sessions.State;
import com.google.adk.tools.ToolContext;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CaseBossToolsTest {

    private final InMemoryCaseRepository cases = new InMemoryCaseRepository();
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-18T12:00:00Z"), ZoneId.of("Asia/Kolkata"));
    private CaseBossTools tools;

    @BeforeEach
    void setUp() {
        LetterService letterService = mock(LetterService.class);
        tools = new CaseBossTools(cases, new InMemoryLetterRepository(),
                new DeadlineEngine(new InMemoryDeadlineStore(), new ClockCatalog()),
                letterService, new InMemoryStepWriter(), clock);
        cases.save(Case.newCase("c1", "u1", "en", clock.instant(), null));
    }

    @Test
    void resolvingACaseArmsTheNinetyDayAutoDelete() {
        ToolContext context = mock(ToolContext.class);
        org.mockito.Mockito.when(context.state()).thenReturn(new State(Map.of("caseId", "c1")));

        tools.setStage("RESOLVED", "All released", context);

        Map<String, Object> raw = cases.findRaw("c1").orElseThrow();
        assertThat(raw).containsKeys("closedAt", "expireAt");
        assertThat(raw.get("expireAt")).isNotNull();
    }

    @Test
    void otherStagesDoNotTouchTheDeleteClock() {
        ToolContext context = mock(ToolContext.class);
        org.mockito.Mockito.when(context.state()).thenReturn(new State(Map.of("caseId", "c1")));

        tools.setStage("WAITING", "Waiting", context);

        assertThat(cases.findRaw("c1").orElseThrow()).doesNotContainKeys("closedAt", "expireAt");
    }
}
