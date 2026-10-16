package app.bonafide.documents;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MaskingTest {

    @Test
    void accountNumbersKeepOnlyTheLast4Digits() {
        assertThat(Masking.accountLast4("123456789012")).isEqualTo("••9012");
        assertThat(Masking.accountLast4("4821")).isEqualTo("••4821");
        assertThat(Masking.accountLast4("12")).isEqualTo("••");
        assertThat(Masking.accountLast4("SBI 123456784821")).isEqualTo("••4821");
        assertThat(Masking.accountLast4(null)).isNull();
    }

    @Test
    void aadhaarNumbersAreMasked() {
        assertThat(Masking.mask("Aadhaar 1234 5678 9012 ok")).isEqualTo("Aadhaar •••• •••• •••• ok");
        assertThat(Masking.mask("Aadhaar 123456789012 ok")).isEqualTo("Aadhaar •••• •••• •••• ok");
    }

    @Test
    void panNumbersAreMasked() {
        assertThat(Masking.mask("PAN ABCDE1234F is mine")).isEqualTo("PAN PAN••••• is mine");
    }

    @Test
    void ordinaryTextStaysUntouched() {
        String text = "Your account is frozen by Cyber Police Station, Patna. Complaint 31210260054321.";
        assertThat(Masking.mask(text)).isEqualTo(text);
    }

    @Test
    void blankInputStaysAsItWas() {
        assertThat(Masking.mask(null)).isNull();
        assertThat(Masking.mask("  ")).isEqualTo("  ");
    }
}
