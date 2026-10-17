package app.bonafide.agents;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.outputs.ReaderOutput;
import app.bonafide.agents.outputs.SorterOutput;
import app.bonafide.cases.Case;
import app.bonafide.cases.Stage;
import app.bonafide.config.BonafideProperties;
import app.bonafide.documents.PaperService;
import app.bonafide.events.Event;
import app.bonafide.events.EventType;
import app.bonafide.letters.DraftChecker;
import app.bonafide.letters.LetterCatalog;
import app.bonafide.letters.LetterService;
import app.bonafide.money.MoneyTracer;
import app.bonafide.rules.RuleChunk;
import app.bonafide.rules.RuleMapLoader;
import app.bonafide.safety.NoopGuard;
import app.bonafide.support.TestFakes.FakeGrounding;
import app.bonafide.support.TestFakes.InMemoryCaseRepository;
import app.bonafide.support.TestFakes.InMemoryDocumentRepository;
import app.bonafide.support.TestFakes.InMemoryEmbedder;
import app.bonafide.support.TestFakes.InMemoryFileStore;
import app.bonafide.support.TestFakes.InMemoryLetterRepository;
import app.bonafide.support.TestFakes.InMemoryRuleRepository;
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

    private static final RuleChunk RULE = new RuleChunk(
            "mha-sop-2026", "clause 10.1(a)", "the bank shall file the grievance within 7 days",
            "IN_FORCE", "2026-01-02", "https://example.gov.in/sop");

    private final InMemoryCaseRepository cases = new InMemoryCaseRepository();
    private final InMemoryFileStore files = new InMemoryFileStore();
    private final InMemoryDocumentRepository documents = new InMemoryDocumentRepository();
    private final InMemoryStepWriter steps = new InMemoryStepWriter();
    private final InMemoryRuleRepository rules = new InMemoryRuleRepository();
    private final InMemoryLetterRepository letters = new InMemoryLetterRepository();
    private final PaperService papers = new PaperService(files, new NoopGuard());
    private final TraceWriter trace = new TraceWriter(steps);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-16T12:00:00Z"), ZoneId.of("Asia/Kolkata"));

    /** The real AgentRunner would call Gemini; the test substitutes canned agent answers. */
    private final AgentRunner runner = new AgentRunner() {
        @Override
        @SuppressWarnings("unchecked")
        public <T> T runJson(
                BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts, Class<T> type) {
            if (type == ReaderOutput.class) {
                return (T) raviOutput();
            }
            if (type == SorterOutput.class) {
                return (T) new SorterOutput(
                        "GENUINE", List.of("The payment matches the bill and the chat."), List.of(), "SHOP_UPI", false);
            }
            throw new IllegalArgumentException("Unexpected type in test: " + type);
        }

        @Override
        public String run(BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts) {
            return "{\"chunks\": []}";
        }

        @Override
        public RunWithState runWithState(
                BaseAgent agent, String caseId, Map<String, Object> initialState, List<Part> parts) {
            return new RunWithState("", Map.of("draft", draftJson()));
        }
    };

    private FirstRunWorkflow workflow;

    @BeforeEach
    void setUp() {
        rules.chunks.put(RULE.id(), RULE);
        BonafideProperties properties = new BonafideProperties(
                "asia-southeast1", "", "gemini-3.8-flash", "gemini-3.5-flash-lite",
                "gemini-embedding-2", "", 0.6, true, "", "", "../data/rules");
        RuleFinderTool ruleFinderTool = new RuleFinderTool(new InMemoryEmbedder(), rules);
        LetterCatalog catalog = new LetterCatalog();
        DraftChecker checker = new DraftChecker(new FakeGrounding(), properties, catalog);
        AgentFactory factory = new AgentFactory(new Prompts(), properties, ruleFinderTool, checker);
        LetterService letterService = new LetterService(factory, runner, checker, catalog, rules, letters, trace);
        workflow = new FirstRunWorkflow(
                papers, factory, runner, new MoneyTracer(new RuleMapLoader()), cases, documents, trace, clock,
                letterService, letters);
        cases.save(Case.newCase("c1", "u1", "en", clock.instant(), null));
    }

    @Test
    void raviCaseLandsOnLetterReadyWithFactsMoneyAndALetter() {
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
        assertThat(after.nextStep()).containsEntry("action", "REVIEW_LETTER");
        assertThat(after.nextStep().get("letterId")).isNotNull();
        assertThat(letters.letters).hasSize(1);
        assertThat(documents.documents).isNotEmpty();
        assertThat(steps.steps).extracting(s -> s.get("agent"))
                .contains("READER", "SORTER", "MONEY");
    }

    private static String sms() {
        return "Demo Bank. Account xxxxxxxx4821 is frozen (whole account) on 2026-10-16 by "
                + "Cyber Police Station, Patna, complaint 31210260054321. Disputed UTR 601234567890 "
                + "on 2026-10-15 for Rs 2,000. Balance Rs 1,80,000.";
    }

    private static String draftJson() {
        return """
                {
                  "title": "Letter to your branch",
                  "to": "The Branch Manager",
                  "subject": "Request to release my frozen balance",
                  "body": "My account ending ••4821 was frozen for one payment of ₹2,000 with UTR 601234567890, complaint 31210260054321. The frozen amount is ₹1,80,000 and ₹1,78,000 should be free. I offer to keep the disputed amount on hold [1]. Please share the police details and file my grievance within 7 days. Enclosed: the evidence. {{Your name}}, date",
                  "citations": [{"n": 1, "chunkId": "mha-sop-2026-clause-10-1-a", "quote": "file the grievance within 7 days"}],
                  "attachments": ["Repair bill and chat"]
                }
                """;
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
