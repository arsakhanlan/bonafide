package app.bonafide.documents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayOutputStream;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

class PdfTextTest {

    @Test
    void extractsTextFromPdfBytes() throws Exception {
        byte[] pdf = makePdf("Account frozen. UTR 601234567890.");
        assertThat(PdfText.extract(pdf)).contains("Account frozen").contains("601234567890");
    }

    @Test
    void junkBytesAreRejected() {
        assertThatThrownBy(() -> PdfText.extract("not a pdf".getBytes()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PDF");
    }

    private static byte[] makePdf(String text) throws Exception {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.newLineAtOffset(50, 700);
                content.showText(text);
                content.endText();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }
}
