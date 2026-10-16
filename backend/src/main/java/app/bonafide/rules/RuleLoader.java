package app.bonafide.rules;

import app.bonafide.config.BonafideProperties;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * One-off job (profile load-rules): clean the source texts, split them by clause/section,
 * embed each chunk (768, normalised) and save it to Firestore. Re-runs replace chunks,
 * because chunk ids are deterministic.
 */
@Component
public class RuleLoader {

    private static final Logger log = LoggerFactory.getLogger(RuleLoader.class);

    private static final Pattern PAGE_MARKER = Pattern.compile("^=== PAGE \\d+ ===$");
    private static final Pattern PAGE_OF = Pattern.compile("^Page \\d+ of \\d+$");
    private static final Pattern SECTION = Pattern.compile("^\\s*(\\d{1,3})\\.\\s+\\((\\d+)\\)\\s*(.*)$");
    private static final Pattern CLAUSE = Pattern.compile("^\\s*(\\d{1,2}\\.\\d{1,2}(?:\\.\\d+)?(?:\\([a-z]+\\))?)\\s+(.*)$");
    private static final Pattern LETTER = Pattern.compile("^\\s*\\(([a-z]+)\\)\\s+(.*)$");
    private static final int MAX_CHUNK = 1200;

    private final RuleRepository rules;
    private final Embedder embedder;
    private final BonafideProperties properties;

    public RuleLoader(RuleRepository rules, Embedder embedder, BonafideProperties properties) {
        this.rules = rules;
        this.embedder = embedder;
        this.properties = properties;
    }

    public int load() throws IOException {
        Path dir = Path.of(properties.rulesDir());
        List<Map<String, Object>> sources = new JsonMapper().readValue(
                Files.readString(dir.resolve("sources.json")), List.class);
        int saved = 0;
        for (Map<String, Object> source : sources) {
            if (source.get("file") == null || !Boolean.TRUE.equals(source.get("fetched"))) {
                continue;
            }
            String text = Files.readString(dir.resolve((String) source.get("file")), StandardCharsets.UTF_8);
            if ("mha-sop-2026".equals(source.get("id"))) {
                // The first pages are a table of contents; the body starts at the first real heading.
                int body = text.indexOf("9.1 Measures to be taken by Banks:");
                if (body > 0) {
                    text = text.substring(body);
                }
            }
            String cleaned = clean(text);
            List<RuleChunk> chunks = split(
                    (String) source.get("id"),
                    (String) source.get("status"),
                    String.valueOf(source.get("date")),
                    (String) source.get("url"),
                    cleaned);
            for (RuleChunk chunk : chunks) {
                double[] vector = toArray(embedder.embed(chunk.text()));
                rules.save(chunk, vector);
                saved++;
            }
            log.info("Loaded {} chunks from {}", chunks.size(), source.get("id"));
        }
        return saved;
    }

    /** Page-break noise out, hyphenated line breaks joined, whitespace normalised. */
    static String clean(String text) {
        StringBuilder out = new StringBuilder();
        for (String line : text.replace("\r\n", "\n").split("\n")) {
            String trimmed = line.trim();
            if (PAGE_MARKER.matcher(trimmed).matches() || PAGE_OF.matcher(trimmed).matches()) {
                continue;
            }
            out.append(trimmed).append('\n');
        }
        return out.toString().replaceAll("-\\n", "").replaceAll("\\n{3,}", "\n\n").trim();
    }

    /** SOP by clause ("clause 10.1(a)"), statutes by section ("section 106(1)"), else paragraphs. */
    static List<RuleChunk> split(String docId, String status, String date, String sourceUrl, String text) {
        List<RuleChunk> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        String currentRef = "whole document";
        int parts = 1;

        for (String line : text.split("\n")) {
            Matcher section = SECTION.matcher(line);
            Matcher clause = CLAUSE.matcher(line);
            Matcher letter = LETTER.matcher(line);
            if (section.find()) {
                flush(docId, status, date, sourceUrl, currentRef, parts, current.toString(), chunks);
                currentRef = "section " + section.group(1) + "(" + section.group(2) + ")";
                parts = 1;
                current = new StringBuilder(line);
            } else if (clause.find()) {
                flush(docId, status, date, sourceUrl, currentRef, parts, current.toString(), chunks);
                currentRef = "clause " + clause.group(1);
                parts = 1;
                current = new StringBuilder(line);
            } else if (letter.find() && currentRef.startsWith("clause")) {
                flush(docId, status, date, sourceUrl, currentRef, parts, current.toString(), chunks);
                currentRef = currentRef + "(" + letter.group(1) + ")";
                parts = 1;
                current = new StringBuilder(line);
            } else {
                current.append(line).append('\n');
            }
        }
        flush(docId, status, date, sourceUrl, currentRef, parts, current.toString(), chunks);
        return chunks;
    }

    private static void flush(String docId, String status, String date, String sourceUrl,
                              String ref, int parts, String text, List<RuleChunk> out) {
        String body = text.trim();
        if (body.isEmpty()) {
            return;
        }
        if (body.length() <= MAX_CHUNK) {
            out.add(new RuleChunk(docId, ref, body, status, date, sourceUrl));
            return;
        }
        // Long chunks are cut at word boundaries; later parts get "(part N)" in the ref.
        String remaining = body;
        while (remaining.length() > MAX_CHUNK) {
            int cut = remaining.lastIndexOf(' ', MAX_CHUNK);
            if (cut < 0) {
                cut = MAX_CHUNK;
            }
            out.add(new RuleChunk(docId, ref + (parts > 1 ? " (part " + parts + ")" : ""),
                    remaining.substring(0, cut).trim(), status, date, sourceUrl));
            remaining = remaining.substring(cut).trim();
            parts++;
        }
        if (!remaining.isEmpty()) {
            out.add(new RuleChunk(docId, ref + (parts > 1 ? " (part " + parts + ")" : ""),
                    remaining, status, date, sourceUrl));
        }
    }

    private static double[] toArray(List<Float> values) {
        double[] array = new double[values.size()];
        for (int i = 0; i < values.size(); i++) {
            array[i] = values.get(i);
        }
        return array;
    }
}
