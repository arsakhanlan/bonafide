package app.bonafide.demo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * Loads the demo personas from resources/demo/{name}/. Text papers stay as-is; the statement
 * is turned into a real PDF at startup so the PDF reading path is exercised (BUILD_SPEC §16).
 */
@Component
public class DemoPapers {

    public Persona load(String name) {
        try {
            String base = "demo/" + name + "/";
            Map<?, ?> persona = new JsonMapper().readValue(
                    new ClassPathResource(base + "persona.json").getInputStream(), Map.class);
            String note = (String) persona.get("note");
            List<Map<String, Object>> papers = new ArrayList<>();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = (List<Map<String, Object>>) persona.get("papers");
            for (Map<String, Object> paper : list) {
                byte[] content = readPaper(base + paper.get("file"), (String) paper.get("mime"));
                papers.add(Map.of(
                        "file", paper.get("file"),
                        "kind", paper.get("kind"),
                        "mime", paper.get("mime"),
                        "content", content));
            }
            return new Persona((String) persona.get("title"), note, papers);
        } catch (IOException e) {
            throw new IllegalArgumentException("Unknown demo persona: " + name, e);
        }
    }

    /** Only the statement is a real PDF; other papers keep their text bytes. */
    private static byte[] readPaper(String path, String mime) throws IOException {
        String text = new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        if ("application/pdf".equals(mime)) {
            return toPdf(text);
        }
        return text.getBytes(StandardCharsets.UTF_8);
    }

    static byte[] toPdf(String text) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                content.newLineAtOffset(40, 750);
                content.setLeading(13);
                for (String line : text.split("\n")) {
                    content.showText(line);
                    content.newLine();
                }
                content.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Could not build the demo statement PDF", e);
        }
    }

    public record Persona(String title, String note, List<Map<String, Object>> papers) {
    }
}
