package app.bonafide.letters;

import app.bonafide.agents.AgentFactory;
import app.bonafide.agents.AgentRunner;
import app.bonafide.agents.Json;
import app.bonafide.agents.outputs.Draft;
import app.bonafide.agents.outputs.Draft.Citation;
import app.bonafide.agents.outputs.RuleFinderOutput;
import app.bonafide.rules.QuoteChecker;
import app.bonafide.rules.RuleChunk;
import app.bonafide.rules.RuleRepository;
import app.bonafide.trace.TraceWriter;
import com.google.genai.types.Part;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * RuleFinder → letter loop → re-check → save (BUILD_SPEC §10.5–10.6).
 * If the RuleFinder fails, the must-include chunks from the spec still carry the letter.
 */
@Service
public class LetterService {

    private final AgentFactory factory;
    private final AgentRunner runner;
    private final DraftChecker checker;
    private final LetterCatalog catalog;
    private final RuleRepository rules;
    private final LetterRepository letters;
    private final TraceWriter trace;

    public LetterService(
            AgentFactory factory,
            AgentRunner runner,
            DraftChecker checker,
            LetterCatalog catalog,
            RuleRepository rules,
            LetterRepository letters,
            TraceWriter trace) {
        this.factory = factory;
        this.runner = runner;
        this.checker = checker;
        this.catalog = catalog;
        this.rules = rules;
        this.letters = letters;
        this.trace = trace;
    }

    public record CaseData(
            Map<String, Object> facts,
            BigDecimal disputed,
            BigDecimal frozen,
            BigDecimal release,
            List<Map<String, Object>> evidence,
            String personNote) {
    }

    public DraftResult draft(String caseId, LetterKind kind, CaseData data) {
        LetterSpec spec = catalog.get(kind);
        List<RuleChunk> chunks = findChunks(caseId, spec, data);
        CheckContext context = new CheckContext(
                spec, chunks, data.disputed(), data.frozen(), data.release(), 0.6,
                data.facts(), data.evidence(), data.personNote());

        TraceWriter.Handle writing = trace.start(caseId, "WRITER", "Writing your letter…");
        Map<String, Object> loopContext = new LinkedHashMap<>();
        loopContext.put("kind", kind.name());
        loopContext.put("facts", data.facts());
        loopContext.put("disputed", data.disputed().doubleValue());
        loopContext.put("frozen", data.frozen().doubleValue());
        loopContext.put("release", data.release().doubleValue());
        loopContext.put("evidence", data.evidence());
        loopContext.put("chunks", chunks.stream().map(c -> Map.of(
                "id", c.id(), "docId", c.docId(), "ref", c.ref(), "text", c.text(),
                "status", c.status(), "sourceUrl", c.sourceUrl() == null ? "" : c.sourceUrl())).toList());
        loopContext.put("spec", Map.of(
                "title", spec.title(), "to", spec.to(), "purpose", spec.purpose(),
                "requiredFields", spec.requiredFields(), "guidance", spec.guidance(),
                "maxWords", spec.maxWords()));

        AgentRunner.RunWithState run = runner.runWithState(
                factory.letterLoop(), caseId, Map.of("context", loopContext),
                List.of(Part.fromText("Write the " + kind + " letter.\nContext:\n" + Json.write(loopContext))));
        Draft draft = Json.parse(asText(run.state().get("draft")), Draft.class);
        writing.done("Drafted. Checking every quote…");

        Draft cleaned = removeFailingCitations(draft, context);
        DraftChecker.CheckResult result = checker.evaluate(cleaned, context);

        String letterId = "l_" + java.util.UUID.randomUUID().toString().substring(0, 7);
        letters.save(caseId, letterId, letterMap(letterId, kind, cleaned, context, result));
        return new DraftResult(letterId, cleaned, result);
    }

    private List<RuleChunk> findChunks(String caseId, LetterSpec spec, CaseData data) {
        TraceWriter.Handle finding = trace.start(caseId, "RULES", "Finding the rules that fit…");
        Map<String, RuleChunk> byId = new LinkedHashMap<>();

        // Must-include refs from the letter spec, e.g. clause 10.1(a) for L1.
        for (String ref : spec.mustIncludeRefs()) {
            rules.findByRef(ref).ifPresent(c -> byId.put(c.id(), c));
        }

        // The RuleFinder agent adds context-matched chunks; its failure leaves the map alone.
        try {
            String text = runner.run(factory.rulefinder(), caseId, Map.of(),
                    List.of(Part.fromText("Case type and money problems:\n" + Json.write(Map.of(
                            "facts", data.facts(),
                            "kind", spec.kind().name())))));
            RuleFinderOutput output = Json.parse(text, RuleFinderOutput.class);
            for (RuleFinderOutput.ChunkPick pick : output.chunks() == null
                    ? List.<RuleFinderOutput.ChunkPick>of() : output.chunks()) {
                rules.findById(pick.chunkId()).ifPresent(c -> byId.putIfAbsent(c.id(), c));
            }
        } catch (Exception e) {
            finding.info("The rule search is not ready yet; using the must-include rules.");
        }

        List<RuleChunk> chunks = new ArrayList<>(byId.values());
        finding.done("Found " + chunks.size() + " rules that fit.");
        return chunks.size() > 8 ? chunks.subList(0, 8) : chunks;
    }

    /** After the loop, code always re-checks and drops any citation whose quote fails. */
    static Draft removeFailingCitations(Draft draft, CheckContext context) {
        if (draft == null) {
            return null;
        }
        Set<Integer> drop = new LinkedHashSet<>();
        for (Citation citation : draft.citations() == null ? List.<Citation>of() : draft.citations()) {
            RuleChunk chunk = context.chunkById(citation.chunkId());
            if (chunk == null || !QuoteChecker.contains(chunk.text(), citation.quote())) {
                drop.add(citation.n());
            }
        }
        if (drop.isEmpty()) {
            return draft;
        }
        List<Citation> kept = draft.citations().stream().filter(c -> !drop.contains(c.n())).toList();
        String body = draft.body();
        for (int n : drop) {
            body = body.replaceAll("\\[" + n + "]", "");
        }
        return new Draft(draft.title(), draft.to(), draft.subject(), body, kept, draft.attachments());
    }

    private Map<String, Object> letterMap(
            String letterId, LetterKind kind, Draft draft, CheckContext context, DraftChecker.CheckResult result) {
        List<Map<String, Object>> citations = new ArrayList<>();
        for (Citation citation : draft.citations() == null ? List.<Citation>of() : draft.citations()) {
            RuleChunk chunk = context.chunkById(citation.chunkId());
            citations.add(Map.of(
                    "n", citation.n(),
                    "ref", chunk == null ? "" : chunk.ref(),
                    "quote", citation.quote(),
                    "sourceUrl", chunk == null || chunk.sourceUrl() == null ? "" : chunk.sourceUrl(),
                    "status", chunk == null ? "IN_FORCE" : chunk.status()));
        }
        Map<String, Object> letter = new LinkedHashMap<>();
        letter.put("kind", kind.name());
        letter.put("title", draft.title());
        letter.put("to", draft.to());
        letter.put("subject", draft.subject());
        letter.put("body", draft.body());
        letter.put("citations", citations);
        letter.put("attachments", draft.attachments() == null ? List.of() : draft.attachments());
        letter.put("checks", Map.of(
                "passed", result.passed(),
                "rounds", 0,
                "grounding", result.grounding() == null ? 0.0 : result.grounding().doubleValue(),
                "notes", result.problems().stream().map(p -> "Checker: " + p).toList()));
        letter.put("status", "DRAFT");
        letter.put("editedByPerson", false);
        letter.put("createdAt", com.google.cloud.Timestamp.now());
        letter.put("approvedAt", null);
        letter.put("sentOn", null);
        letter.put("sentHow", null);
        letter.put("chunkIds", context.chunks().stream().map(RuleChunk::id).toList());
        letter.put("reminder", false);
        return letter;
    }

    private static String asText(Object value) {
        if (value == null) {
            return "";
        }
        return value instanceof String s ? s : Json.write(value);
    }

    public record DraftResult(String letterId, Draft draft, DraftChecker.CheckResult checks) {
    }
}
