package app.bonafide.agents;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.outputs.ReaderOutput;
import app.bonafide.cases.Case;
import app.bonafide.cases.Stage;
import app.bonafide.documents.PaperService;
import app.bonafide.events.Event;
import app.bonafide.events.EventType;
import app.bonafide.money.MoneyTracer;
import app.bonafide.rules.RuleMapLoader;
import app.bonafide.safety.NoopGuard;
import app.bonafide.support.TestFakes.InMemoryCaseRepository;
import app.bonafide.support.TestFakes.InMemoryDocumentRepository;
import app.bonafide.support.TestFakes.InMemoryFileStore;
import app.bonafide.support.TestFakes.InMemoryStepWriter;
import app.bonafide.trace.TraceWriter;
import com.google.adk.agents.BaseAgent;
import com.google.genai.types.Part;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FirstRunWorkflowTest {

    private final InMemoryCaseRepository cases = new InMemoryCaseRepository();
    private final InMemoryFileStore files = new InMemoryFileStore();
    private final InMemoryDocumentRepository documents = new InMemoryDocumentRepository();
    private final InMemoryStepWriter steps = new InMemoryStepWriter();
    private final PaperService papers = new PaperService(files, new NoopGuard());
    private final TraceWriter trace = new TraceWriter(steps);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-16T12:00:00Z"), ZoneId.of("Asia/Kolkata"));

    /** The real AgentRunner would call Gemini; the test substitutes canned Reader and Sorter answers. */
    private final AgentRunner runner = new AgentRunner() {
        @Override
        @SuppressWarnings("unchecked")
        public <T> T runJson(
                BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts, Class<T> type) {
            if (type == ReaderOutput.class) {
                return (T) raviOutput();
            }
            if (type == app.bonafide.agents.outputs.SorterOutput.class) {
                return (T) new app.bonafide.agents.outputs.SorterOutput(
                        "GENUINE", List.of("The payment matches the bill and the chat."), List.of(), "SHOP_UPI", false);
            }
            throw new IllegalArgumentException("Unexpected type in test: " + type);
        }
    };

    private FirstRunWorkflow workflow;

    @BeforeEach
    void setUp() {
        workflow = new FirstRunWorkflow(
                papers, new AgentFactory(new Prompts(), new app.bonafide.config.BonafideProperties(
                        "asia-southeast1", "", "gemini-3.8-flash", "gemini-3.5-flash-lite",
                        "gemini-embedding-2", "", 0.6, true, "", "", "../data/rules")),
                runner, new MoneyTracer(new RuleMapLoader()), cases, documents, trace, clock);
        cases.save(Case.newCase("c1", "u1", "en", clock.instant(), null));
    }

    @Test
    void raviCaseLandsOnLetterReadyWithFactsAndMoney() {
        files.write("uploads/u1/c1/a1.txt", sms().getBytes(StandardCharsets.UTF_8), "text/plain");
        Event event = Event.newPending("c1", EventType.UPLOAD,
                Map.of("files", List.of(Map.of("path", "uploads/u1/c1/a1.txt", "kind", "NOTICE", "mime", "text/plain"))),
                clock.instant());

        workflow.run("c1", event);

        Case after = cases.cases.get("c1");
        assertThat(after.stage()).isEqualTo(Stage.LETTER_READY);
        assertThat(after.facts()).containsEntry("bank", "Demo Bank");
        assertThat(after.facts()).containsEntry("accountLast4", "••4821");
        assertThat(after.money()).containsEntry("frozen", 180000.0);
        assertThat(after.money()).containsEntry("disputed", 2000.0);
        assertThat(after.money()).containsEntry("release", 178000.0);
        assertThat(documents.documents).isNotEmpty();
        assertThat(steps.steps).extracting(s -> s.get("agent"))
                .contains("READER", "MONEY");
    }

    private static String sms() {
        return "Demo Bank. Account xxxxxxxx4821 is frozen (whole account) on 2026-10-16 by "
                + "Cyber Police Station, Patna, complaint 31210260054321. Disputed UTR 601234567890 "
                + "on 2026-10-15 for Rs 2,000. Balance Rs 1,80,000.";
    }

    private static ReaderOutput raviOutput() {
        return new ReaderOutput(
                List.of(new ReaderOutput.Document("doc1", "NOTICE", true, "Freeze SMS", null, List.of())),
                new ReaderOutput.Facts("Demo Bank", "FC Road, Pune", "xxxxxxxx4821", "WHOLE_ACCOUNT",
                        "2026-10-16", null, "180000", "31210260054321", "Cyber Police Station, Patna",
                        null, "Bihar", false, false, null,
                        List.of(new ReaderOutput.DisputedPayment("601234567890", "2026-10-15", "2000", "UPI customer"))),
                List.of(new ReaderOutput.StatementLine("2026-10-15", "2000", "CREDIT",
                        "601234567890", "UPI customer", "180000")),
                "A customer paid for a repair.", List.of(), null, null, null);
    }
}
