package app.bonafide.money;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class IndianRupeesTest {

    @Test
    void smallNumbersHaveNoGrouping() {
        assertThat(IndianRupees.format(new BigDecimal("0"))).isEqualTo("₹0");
        assertThat(IndianRupees.format(new BigDecimal("2000"))).isEqualTo("₹2,000");
        assertThat(IndianRupees.format(new BigDecimal("999"))).isEqualTo("₹999");
    }

    @Test
    void lakhsGroupInIndianStyle() {
        assertThat(IndianRupees.format(new BigDecimal("180000"))).isEqualTo("₹1,80,000");
        assertThat(IndianRupees.format(new BigDecimal("178000"))).isEqualTo("₹1,78,000");
        assertThat(IndianRupees.format(new BigDecimal("8260000"))).isEqualTo("₹82,60,000");
    }

    @Test
    void croresAndBeyond() {
        assertThat(IndianRupees.format(new BigDecimal("250000000"))).isEqualTo("₹25,00,00,000");
    }

    @Test
    void paiseAppearOnlyWhenNonZero() {
        assertThat(IndianRupees.format(new BigDecimal("1999.50"))).isEqualTo("₹1,999.50");
        assertThat(IndianRupees.format(new BigDecimal("2000.00"))).isEqualTo("₹2,000");
        assertThat(IndianRupees.format(new BigDecimal("0.05"))).isEqualTo("₹0.05");
    }

    @Test
    void nullIsSafe() {
        assertThat(IndianRupees.format(null)).isEqualTo("₹0");
    }
}
