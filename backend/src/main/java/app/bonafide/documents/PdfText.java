package app.bonafide.documents;

import java.io.IOException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

/** Plain text out of PDF bytes, with PDFBox 3 (Loader.loadPDF, BUILD_SPEC §3). */
public final class PdfText {

    private PdfText() {
    }

    public static String extract(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException e) {
            throw new IllegalArgumentException("Not a readable PDF", e);
        }
    }
}
