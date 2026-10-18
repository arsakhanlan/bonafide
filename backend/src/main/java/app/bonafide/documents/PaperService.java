package app.bonafide.documents;

import app.bonafide.safety.Guard;
import com.google.genai.types.Part;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Turns an UPLOAD/REPLY event into Reader input: PDFs become text, photos stay as bytes,
 * everything is wrapped in <paper> tags so the papers are data, never instructions.
 */
@Service
public class PaperService {

    private final FileStore files;
    private final Guard guard;

    public PaperService(FileStore files, Guard guard) {
        this.files = files;
        this.guard = guard;
    }

    public Prepared prepare(Map<String, Object> payload) {
        List<Part> parts = new ArrayList<>();
        List<Paper> papers = new ArrayList<>();
        if (!(payload.get("files") instanceof List<?> fileList)) {
            return new Prepared(List.of(), List.of());
        }
        @SuppressWarnings("unchecked")
        List<Map<String, String>> refs = (List<Map<String, String>>) fileList;
        int n = 0;
        for (Map<String, String> ref : refs) {
            String docId = "doc" + (++n);
            String path = ref.get("path");
            String kind = ref.getOrDefault("kind", "OTHER");
            String mime = ref.get("mime");
            byte[] bytes = files.read(path);
            if ("application/pdf".equals(mime)) {
                String text = PdfText.extract(bytes);
                boolean flagged = guard.check(text).flagged();
                papers.add(new Paper(docId, path, kind, mime, fileName(path), text, "PDF_TEXT", flagged, null));
                parts.add(Part.fromText(wrap(docId, kind, text)));
            } else if (mime != null && mime.startsWith("image/")) {
                papers.add(new Paper(docId, path, kind, mime, fileName(path), null, "AI_TRANSCRIPT", false, null));
                parts.add(Part.fromText("Photo " + docId + " (" + kind + "):"));
                parts.add(Part.fromBytes(bytes, mime));
            } else {
                String text = new String(bytes, StandardCharsets.UTF_8);
                boolean flagged = guard.check(text).flagged();
                papers.add(new Paper(docId, path, kind, mime, fileName(path), text, "PASTED", flagged, null));
                parts.add(Part.fromText(wrap(docId, kind, text)));
            }
        }
        String pasted = (String) payload.get("text");
        if (pasted != null && !pasted.isBlank()) {
            String docId = "doc" + (++n);
            boolean flagged = guard.check(pasted).flagged();
            papers.add(new Paper(docId, null, "OTHER", null, "pasted text", pasted, "PASTED", flagged, null));
            parts.add(Part.fromText(wrap(docId, "PASTED", pasted)));
        }
        return new Prepared(parts, papers);
    }

    private static String wrap(String docId, String kind, String text) {
        return "<paper id=\"" + docId + "\" kind=\"" + kind + "\">\n" + text + "\n</paper>";
    }

    private static String fileName(String path) {
        int slash = path.lastIndexOf('/');
        return slash < 0 ? path : path.substring(slash + 1);
    }

    /** One paper, ready for the Reader and later for the documents collection. */
    public record Paper(
            String docId,
            String path,
            String kind,
            String mime,
            String fileName,
            String text,
            String textSource,
            boolean guardFlagged,
            String transcript) {
    }

    public record Prepared(List<Part> parts, List<Paper> papers) {
    }
}
