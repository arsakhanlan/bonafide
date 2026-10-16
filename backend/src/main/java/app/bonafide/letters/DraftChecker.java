package app.bonafide.letters;

import app.bonafide.agents.Json;
import app.bonafide.agents.outputs.Draft;
import app.bonafide.agents.outputs.Draft.Citation;
import app.bonafide.config.BonafideProperties;
import app.bonafide.money.IndianRupees;
import app.bonafide.rules.QuoteChecker;
import app.bonafide.rules.RuleChunk;
import com.google.adk.tools.ToolContext;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * The plain-code checks every draft must pass (BUILD_SPEC §10.6): quotes word-for-word,
 * required fields, tone, amounts, and Google Check Grounding. Exposed to the Checker agent
 * as the checkDraft tool; also re-run by the code after the loop.
 */
@Component
public class DraftChecker {

    private static final Pattern MARKER = Pattern.compile("\\[(\\d+)]");
    private static final List<String> BANNED =
            List.of("guarantee", "you will get", "legal advice", "we will take action",
                    "sue you", "incompetent", "negligent", "unprofessional");

    private final Grounding grounding;
    private final BonafideProperties properties;
    private final LetterCatalog catalog;

    public DraftChecker(Grounding grounding, BonafideProperties properties, LetterCatalog catalog) {
        this.grounding = grounding;
        this.properties = properties;
        this.catalog = catalog;
    }

    /** The ADK tool: the draft and context come from the session state. */
    public Map<String, Object> checkDraft(ToolContext toolContext) {
        Map<String, Object> state = toolContext.state();
        Draft draft = Json.parse(asText(state.get("draft")), Draft.class);
        CheckContext context = contextFromState(state);
        CheckResult result = evaluate(draft, context);
        return Map.of(
                "passed", result.passed(),
                "problems", result.problems(),
                "grounding", result.grounding() == null ? "unavailable" : result.grounding());
    }

    @SuppressWarnings("unchecked")
    private CheckContext contextFromState(Map<String, Object> state) {
        Map<String, Object> context = state.get("context") instanceof Map
                ? (Map<String, Object>) state.get("context")
                : Json.parse(asText(state.get("context")), Map.class);
        List<RuleChunk> chunks = new ArrayList<>();
        for (Object chunk : (List<Object>) context.getOrDefault("chunks", List.of())) {
            Map<String, Object> c = (Map<String, Object>) chunk;
            chunks.add(new RuleChunk(
                    (String) c.get("docId"), (String) c.get("ref"), (String) c.get("text"),
                    (String) c.get("status"), (String) c.get("date"), (String) c.get("sourceUrl")));
        }
        return new CheckContext(
                specOf((String) context.get("kind")),
                chunks,
                decimal(context.get("disputed")),
                decimal(context.get("frozen")),
                decimal(context.get("release")),
                properties.groundingMin(),
                asMap(context.get("facts")),
                asList(context.get("evidence")),
                (String) context.get("personNote"));
    }

    private LetterSpec specOf(String kind) {
        return catalog.get(LetterKind.valueOf(kind));
    }

    public CheckResult evaluate(Draft draft, CheckContext context) {
        List<String> problems = new ArrayList<>();
        if (draft == null) {
            return new CheckResult(false, List.of("The draft is empty."), null);
        }

        int words = draft.body() == null ? 0 : draft.body().trim().split("\\s+").length;
        if (words > context.spec().maxWords()) {
            problems.add("The letter is too long: " + words + " words (limit " + context.spec().maxWords() + ").");
        }

        Set<Integer> markers = markersIn(draft.body());
        Set<Integer> cited = new LinkedHashSet<>();
        for (Citation citation : draft.citations() == null ? List.<Citation>of() : draft.citations()) {
            if (cited.contains(citation.n())) {
                problems.add("Citation " + citation.n() + " is listed twice.");
            }
            cited.add(citation.n());
            RuleChunk chunk = context.chunkById(citation.chunkId());
            if (chunk == null) {
                problems.add("Citation " + citation.n() + " points to a rule that is not in the library.");
            } else if (!QuoteChecker.contains(chunk.text(), citation.quote())) {
                problems.add("The quote in citation " + citation.n() + " is not word-for-word in the rule.");
            }
        }
        for (int marker : markers) {
            if (!cited.contains(marker)) {
                problems.add("Marker [" + marker + "] has no citation.");
            }
        }
        for (int n : cited) {
            if (!markers.contains(n)) {
                problems.add("Citation " + n + " is never used in the letter.");
            }
        }

        for (String field : context.spec().requiredFields()) {
            if (!requiredFieldPresent(field, draft.body())) {
                problems.add("Missing: " + field + ".");
            }
        }

        for (String banned : BANNED) {
            if (draft.body() != null && draft.body().toLowerCase().contains(banned)) {
                problems.add("Banned wording: \"" + banned + "\".");
            }
        }

        for (String amount : List.of(
                IndianRupees.format(context.disputed()),
                IndianRupees.format(context.frozen()),
                IndianRupees.format(context.release()))) {
            if (draft.body() == null || !draft.body().contains(amount)) {
                problems.add("The amount " + amount + " is missing or different in the letter.");
            }
        }

        Float score = null;
        if (draft.body() != null && !draft.body().isBlank()) {
            String candidate = MARKER.matcher(draft.body()).replaceAll("");
            score = grounding.check(candidate, factsOf(context), 0.6);
            if (score != null && score < context.groundingMin()) {
                problems.add("The grounding score " + score + " is below " + context.groundingMin() + ".");
            }
        }

        return new CheckResult(problems.isEmpty(), problems, score);
    }

    private static Set<Integer> markersIn(String body) {
        Set<Integer> markers = new LinkedHashSet<>();
        if (body == null) {
            return markers;
        }
        Matcher matcher = MARKER.matcher(body);
        while (matcher.find()) {
            markers.add(Integer.parseInt(matcher.group(1)));
        }
        return markers;
    }

    /** Heuristic presence checks per required field, in plain words. */
    static boolean requiredFieldPresent(String field, String body) {
        String b = body == null ? "" : body.toLowerCase();
        return switch (field) {
            case "last 4 digits of the account" -> Pattern.compile("••\\d{4}").matcher(body == null ? "" : body).find();
            case "complaint number (or \"not known to me\")" ->
                    b.contains("complaint") && (Pattern.compile("\\d{12}").matcher(b).find() || b.contains("not known to me"));
            case "UTR of the disputed payment", "UTR" -> b.contains("utr");
            case "disputed amount" -> true; // checked exactly by the amount checks below
            case "frozen amount" -> true;
            case "release amount" -> true;
            case "the offer to keep the disputed amount on hold" -> b.contains("hold") || b.contains("held");
            case "the request to share the police details" -> b.contains("police");
            case "the request to file on the grievance module within 7 days, citing clause 10.1(a)" ->
                    b.contains("7 days") || b.contains("seven days");
            case "the evidence list" -> b.contains("evidence") || b.contains("enclosed") || b.contains("attach");
            case "{{Your name}}" -> b.contains("{{your name}}");
            case "date" -> true; // the person fills the date
            case "complaint number" -> b.contains("complaint");
            case "police station" -> b.contains("police");
            case "a request for a video-call check, citing clause 10.1(c)" ->
                    b.contains("video") && (b.contains("10.1(c)") || b.contains("check"));
            case "a request for written reasons if refused, citing clause 10.1(e)" ->
                    b.contains("reasons") && (b.contains("10.1(e)") || b.contains("refus"));
            case "the refusal date" -> b.contains("refus");
            case "the officer's reasons, in short" -> b.contains("reason");
            case "an answer to each reason" -> b.contains("reason");
            case "the evidence" -> b.contains("evidence");
            case "the 15-day review, citing clause 10.1(f)" -> b.contains("15");
            case "the grievance filing date" -> b.contains("grievance") || b.contains("filed");
            case "\"no decision within 15 calendar days\"" -> b.contains("no decision");
            case "the automatic escalation, citing clause 10.1(f)" -> b.contains("10.1(f)") || b.contains("automatic");
            case "a request to decide within 15 days" -> b.contains("15 days");
            case "\"90 calendar days\" passed with no lawful direction" -> b.contains("90");
            case "the account holder's request to remove the hold, citing the 90-day paragraph of clause 10.1" ->
                    b.contains("remove the hold") || b.contains("lift");
            case "the timeline" -> true;
            case "the amounts" -> true;
            case "the rules and rulings with references" -> b.contains("clause") || b.contains("court");
            case "what has been tried" -> b.contains("tried") || b.contains("sent") || b.contains("filed");
            case "the open deadlines" -> b.contains("deadline") || b.contains("due");
            case "the line \"These are notes, not a petition.\"" -> b.contains("not a petition");
            default -> true; // unknown field: let the Writer's judgement stand
        };
    }

    /** The grounding facts: the rule chunks plus a plain summary of the case, so every
     *  sentence the letter states is backed by something the checker can verify against. */
    private static List<String> factsOf(CheckContext context) {
        List<String> facts = new ArrayList<>();
        for (RuleChunk chunk : context.chunks()) {
            facts.add(chunk.text());
        }
        Map<String, Object> f = context.facts();
        if (!f.isEmpty()) {
            facts.add("The person's bank is " + str(f.get("bank")) + ", branch " + str(f.get("branch"))
                    + ", account ending " + str(f.get("accountLast4")) + ".");
            facts.add("The account was frozen on " + str(f.get("freezeOn")) + " (freeze type "
                    + str(f.get("freezeType")) + ") by " + str(f.get("policeStation"))
                    + " for complaint " + str(f.get("complaintNo")) + ".");
            facts.add("The investigating officer is " + str(f.get("officer")) + ".");
            for (Map<String, Object> payment : asList(f.get("disputedPayments"))) {
                facts.add("A disputed payment: UTR " + str(payment.get("utr")) + " on " + str(payment.get("on"))
                        + " of amount " + str(payment.get("amount")) + " rupees from " + str(payment.get("from")) + ".");
            }
        }
        for (Map<String, Object> item : context.evidence()) {
            facts.add("Evidence " + str(item.get("label")) + ": " + str(item.get("status")) + ".");
        }
        if (context.personNote() != null && !context.personNote().isBlank()) {
            facts.add("The person says: " + context.personNote());
        }
        facts.add("The disputed amount is " + context.disputed()
                + " rupees, the frozen amount is " + context.frozen()
                + " rupees, and the release amount is " + context.release() + " rupees.");
        return facts;
    }

    private static String str(Object value) {
        return value == null ? "not known" : String.valueOf(value);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return value instanceof Map ? (Map<String, Object>) value : Map.of();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> asList(Object value) {
        return value instanceof List ? (List<Map<String, Object>>) value : List.of();
    }

    private static java.math.BigDecimal decimal(Object value) {
        if (value == null) {
            return java.math.BigDecimal.ZERO;
        }
        if (value instanceof Number n) {
            return java.math.BigDecimal.valueOf(n.doubleValue());
        }
        try {
            return new java.math.BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return java.math.BigDecimal.ZERO;
        }
    }

    private static String asText(Object value) {
        if (value == null) {
            return "";
        }
        return value instanceof String s ? s : Json.write(value);
    }

    public record CheckResult(boolean passed, List<String> problems, Float grounding) {
    }
}
