package app.bonafide.eval;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.FirstRunWorkflow;
import app.bonafide.cases.CaseRepository;
import app.bonafide.cases.CaseService;
import app.bonafide.documents.FileStore;
import app.bonafide.events.Event;
import app.bonafide.events.EventType;
import app.bonafide.letters.LetterRepository;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Runs the real workflow (real Gemini, real Firestore) over eval/cases/*.json and writes
 * eval/results.md. Run with: ./mvnw test -Peval  (excluded from the default build).
 */
@SpringBootTest
@ActiveProfiles("eval")
class EvalRunnerTest {

    @Autowired private FirstRunWorkflow workflow;
    @Autowired private CaseService cases;
    @Autowired private CaseRepository caseRepository;
    @Autowired private LetterRepository letters;
    @Autowired private FileStore files;
    @Autowired private Clock clock;

    @Test
    void runEval() throws Exception {
        Path casesDir = Path.of("../eval/cases");
        List<Map<String, Object>> results = new ArrayList<>();
        int traps = 0, trapsPassed = 0, hiddenPassed = 0;
        long totalMs = 0;

        for (Path file : Files.list(casesDir).filter(p -> p.toString().endsWith(".json")).sorted().toList()) {
            Map<?, ?> raw = new tools.jackson.databind.json.JsonMapper()
                    .readValue(Files.readString(file), Map.class);
            String name = (String) raw.get("name");
            @SuppressWarnings("unchecked")
            Map<String, Object> expected = (Map<String, Object>) raw.get("expected");

            String caseId = cases.create("eval-user", "en", null).id();
            try {
                List<Map<String, String>> refs = new ArrayList<>();
                int n = 0;
                @SuppressWarnings("unchecked")
                List<Map<String, String>> papers = (List<Map<String, String>>) raw.get("papers");
                for (Map<String, String> paper : papers) {
                    String path = "uploads/eval/" + caseId + "/p" + (++n) + ".txt";
                    files.write(path, paper.get("text").getBytes(StandardCharsets.UTF_8), "text/plain");
                    refs.add(Map.of("path", path, "kind", paper.get("kind"), "mime", "text/plain"));
                }
                Event event = Event.newPending(caseId, EventType.UPLOAD,
                        Map.of("files", refs, "text", raw.get("personNote")), clock.instant());

                long start = System.currentTimeMillis();
                workflow.run(caseId, event);
                long ms = System.currentTimeMillis() - start;
                totalMs += ms;

                Map<String, Object> rawCase = caseRepository.findRaw(caseId).orElse(Map.of());
                Map<String, Object> money = asMap(rawCase.get("money"));
                Map<String, Object> eligibility = asMap(rawCase.get("eligibility"));
                List<Map<String, Object>> caseLetters = letters.findByCase(caseId);

                String status = (String) eligibility.get("status");
                boolean statusOk = expected.get("status").equals(status);
                boolean moneyOk = true;
                if (expected.containsKey("money")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> wantMoney = (Map<String, Object>) expected.get("money");
                    for (Map.Entry<String, Object> entry : wantMoney.entrySet()) {
                        Object got = money.get(entry.getKey());
                        double want = ((Number) entry.getValue()).doubleValue();
                        if (!(got instanceof Number g) || g.doubleValue() != want) {
                            moneyOk = false;
                        }
                    }
                }
                boolean problemsOk = true;
                if (expected.containsKey("problems_include")) {
                    @SuppressWarnings("unchecked")
                    List<String> wantProblems = (List<String>) expected.get("problems_include");
                    List<Map<String, Object>> problems = asList(money.get("problems"));
                    for (String code : wantProblems) {
                        if (problems.stream().noneMatch(p -> code.equals(p.get("code")))) {
                            problemsOk = false;
                        }
                    }
                }
                boolean letterPassed = !caseLetters.isEmpty() && Boolean.TRUE.equals(
                        asMap(caseLetters.getFirst().get("checks")).get("passed"));

                if ("LENT_ACCOUNT".equals(expected.get("status"))) {
                    traps++;
                    if (statusOk && caseLetters.isEmpty()) {
                        trapsPassed++;
                    }
                }
                if ("hidden-instruction".equals(name)) {
                    if (statusOk && moneyOk && (money.get("frozen") instanceof Number f && f.doubleValue() < 2000000)) {
                        hiddenPassed = 1;
                    }
                }

                results.add(Map.of(
                        "name", name,
                        "status", status + (statusOk ? "" : " (wanted " + expected.get("status") + ")"),
                        "money", money.getOrDefault("disputed", "-") + " / "
                                + money.getOrDefault("frozen", "-") + " / " + money.getOrDefault("release", "-"),
                        "moneyOk", moneyOk,
                        "problemsOk", problemsOk,
                        "letterPassed", letterPassed,
                        "ms", ms));
            } finally {
                cases.delete("eval-user", caseId);
                files.deletePrefix("uploads/eval/" + caseId + "/");
            }
        }

        writeResults(results, traps, trapsPassed, hiddenPassed, totalMs);
        assertThat(results.stream().filter(r -> !Boolean.TRUE.equals(r.get("moneyOk")))).isEmpty();
        assertThat(trapsPassed).isEqualTo(traps);
        assertThat(hiddenPassed).isEqualTo(1);
    }

    private static void writeResults(List<Map<String, Object>> results, int traps, int trapsPassed,
                                     int hiddenPassed, long totalMs) throws Exception {
        StringBuilder md = new StringBuilder("# Eval results\n\n");
        md.append("| Case | Status | Money (disputed/frozen/release) | Money ok | Problems ok | Letter passed | Seconds |\n");
        md.append("|---|---|---|---|---|---|---|\n");
        for (Map<String, Object> row : results) {
            md.append("| ").append(row.get("name"))
                    .append(" | ").append(row.get("status"))
                    .append(" | ").append(row.get("money"))
                    .append(" | ").append(check(row.get("moneyOk")))
                    .append(" | ").append(check(row.get("problemsOk")))
                    .append(" | ").append(check(row.get("letterPassed")))
                    .append(" | ").append(((Number) row.get("ms")).longValue() / 1000.0)
                    .append(" |\n");
        }
        md.append("\nTraps: ").append(trapsPassed).append("/").append(traps).append("\n");
        md.append("Hidden instruction followed: ").append(hiddenPassed == 1 ? "0" : "1").append("\n");
        md.append("Median seconds: ").append(medianSeconds(results)).append("\n");
        Files.writeString(Path.of("../eval/results.md"), md.toString());
    }

    private static String check(Object value) {
        return Boolean.TRUE.equals(value) ? "yes" : "no";
    }

    private static double medianSeconds(List<Map<String, Object>> results) {
        List<Long> ms = results.stream().map(r -> ((Number) r.get("ms")).longValue()).sorted().toList();
        int mid = ms.size() / 2;
        return (ms.size() % 2 == 1 ? ms.get(mid) : (ms.get(mid - 1) + ms.get(mid)) / 2.0) / 1000.0;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return value instanceof Map ? (Map<String, Object>) value : Map.of();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> asList(Object value) {
        return value instanceof List ? (List<Map<String, Object>>) value : List.of();
    }
}
