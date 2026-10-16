package app.bonafide.money;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.money.StatementLine.Direction;
import app.bonafide.rules.RuleMapLoader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The 16 spec cases from BUILD_SPEC §11: Ravi's whole-account freeze, liens, paise, duplicates,
 * the trap inputs. The tracer must never guess money.
 */
class MoneyTracerTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 16);

    private final MoneyTracer tracer = new MoneyTracer(new RuleMapLoader());

    private static BigDecimal m(String s) {
        return new BigDecimal(s);
    }

    private static DisputedPayment payment(String utr, String on, String amount) {
        return new DisputedPayment(utr, LocalDate.parse(on), m(amount), "someone");
    }

    private static StatementLine credit(String on, String amount, String utr) {
        return new StatementLine(LocalDate.parse(on), m(amount), Direction.CREDIT, utr, "party", m(amount));
    }

    private static StatementLine debit(String on, String amount, String utr) {
        return new StatementLine(LocalDate.parse(on), m(amount), Direction.DEBIT, utr, "party", m("0"));
    }

    private static MoneyInput input(
            FreezeType type, String held, String balance, List<DisputedPayment> payments, List<StatementLine> lines) {
        return new MoneyInput(type, held == null ? null : m(held), balance == null ? null : m(balance),
                payments, lines, "31210260054321", "Inspector Gupta", "Cyber Police Station, Patna",
                false, false, 1, null, TODAY);
    }

    private static List<ProblemCode> codes(MoneyResult r) {
        return r.problems().stream().map(Problem::code).toList();
    }

    @Test
    void raviWholeAccountUtrMatch() {
        MoneyResult r = tracer.trace(input(FreezeType.WHOLE_ACCOUNT, null, "180000",
                List.of(payment("601234567890", "2026-10-15", "2000")),
                List.of(credit("2026-10-15", "2000", "601234567890"))));
        assertThat(r.disputed()).isEqualByComparingTo("2000");
        assertThat(r.frozen()).isEqualByComparingTo("180000");
        assertThat(r.release()).isEqualByComparingTo("178000");
        assertThat(codes(r)).containsExactly(ProblemCode.WHOLE_ACCOUNT_FROZEN);
        assertThat(r.unsure()).isFalse();
    }

    @Test
    void lienEqualToDisputedReleasesNothingAndHasNoProblems() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "2000", null,
                List.of(payment("601234567890", "2026-10-15", "2000")),
                List.of(credit("2026-10-15", "2000", "601234567890"))));
        assertThat(r.disputed()).isEqualByComparingTo("2000");
        assertThat(r.frozen()).isEqualByComparingTo("2000");
        assertThat(r.release()).isEqualByComparingTo("0.00");
        assertThat(r.problems()).isEmpty();
    }

    @Test
    void lienLargerThanDisputedFlagsHoldMoreThanDisputed() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "50000", null,
                List.of(payment("U1", "2026-10-14", "12500")),
                List.of(credit("2026-10-14", "12500", "U1"))));
        assertThat(r.release()).isEqualByComparingTo("37500");
        assertThat(codes(r)).containsExactly(ProblemCode.HOLD_MORE_THAN_DISPUTED);
    }

    @Test
    void noUtrMatchesByAmountWithinOneDay() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "5000", null,
                List.of(payment(null, "2026-10-14", "5000")),
                List.of(credit("2026-10-15", "5000", "U9"))));
        assertThat(r.disputed()).isEqualByComparingTo("5000");
        assertThat(r.unsure()).isFalse();
    }

    @Test
    void noMatchMakesItUnsure() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "5000", null,
                List.of(payment("U1", "2026-10-14", "5000")),
                List.of(credit("2026-10-15", "1200", "U2"))));
        assertThat(r.unsure()).isTrue();
    }

    @Test
    void twoDisputedPaymentsAreSummed() {
        MoneyResult r = tracer.trace(input(FreezeType.WHOLE_ACCOUNT, null, "10000",
                List.of(payment("U1", "2026-10-13", "2000"), payment("U2", "2026-10-14", "3000")),
                List.of(credit("2026-10-13", "2000", "U1"), credit("2026-10-14", "3000", "U2"))));
        assertThat(r.disputed()).isEqualByComparingTo("5000");
        assertThat(r.release()).isEqualByComparingTo("5000");
    }

    @Test
    void disputedBiggerThanBalanceFlagsMoneyAlreadyMoved() {
        MoneyResult r = tracer.trace(input(FreezeType.WHOLE_ACCOUNT, null, "1000",
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1"))));
        assertThat(r.release()).isEqualByComparingTo("0.00");
        assertThat(codes(r)).contains(ProblemCode.MONEY_ALREADY_MOVED);
    }

    @Test
    void noAmountInNoticeFlagsNoAmountGiven() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, null, null,
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1"))));
        assertThat(codes(r)).contains(ProblemCode.NO_AMOUNT_GIVEN);
    }

    @Test
    void missingOfficerFlagsMissingDetails() {
        MoneyInput in = new MoneyInput(FreezeType.AMOUNT_HOLD, m("2000"), null,
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1")),
                "31210260054321", null, "Cyber Police Station, Patna",
                false, false, 1, null, TODAY);
        assertThat(codes(tracer.trace(in))).contains(ProblemCode.MISSING_DETAILS);
    }

    @Test
    void grievanceFiled95DaysAgoFlagsHoldTooLong() {
        MoneyInput in = new MoneyInput(FreezeType.AMOUNT_HOLD, m("2000"), null,
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1")),
                "31210260054321", "Inspector Gupta", "Cyber Police Station, Patna",
                false, false, 1, TODAY.minusDays(95), TODAY);
        assertThat(codes(tracer.trace(in))).contains(ProblemCode.HOLD_TOO_LONG);
    }

    @Test
    void digitalBankingBlockedFlagsDigitalBankingSuspended() {
        MoneyInput in = new MoneyInput(FreezeType.DIGITAL_BLOCK, null, null,
                List.of(), List.of(),
                "31210260054321", "Inspector Gupta", "Cyber Police Station, Patna",
                true, false, 1, null, TODAY);
        assertThat(codes(tracer.trace(in))).contains(ProblemCode.DIGITAL_BANKING_SUSPENDED);
    }

    @Test
    void futureCreditHoldIsOnlyFineOnTheFirstLayer() {
        MoneyInput secondLayer = new MoneyInput(FreezeType.AMOUNT_HOLD, m("2000"), null,
                List.of(), List.of(),
                "31210260054321", "Inspector Gupta", "Cyber Police Station, Patna",
                false, true, 2, null, TODAY);
        assertThat(codes(tracer.trace(secondLayer))).contains(ProblemCode.FUTURE_CREDIT_HOLD_NOT_FIRST_LAYER);

        MoneyInput firstLayer = new MoneyInput(FreezeType.AMOUNT_HOLD, m("2000"), null,
                List.of(), List.of(),
                "31210260054321", "Inspector Gupta", "Cyber Police Station, Patna",
                false, true, 1, null, TODAY);
        assertThat(codes(tracer.trace(firstLayer))).doesNotContain(ProblemCode.FUTURE_CREDIT_HOLD_NOT_FIRST_LAYER);
    }

    @Test
    void paiseAmountsSurvive() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "1999.50", null,
                List.of(payment("U1", "2026-10-13", "500")),
                List.of(credit("2026-10-13", "500", "U1"))));
        assertThat(r.frozen()).isEqualByComparingTo("1999.50");
        assertThat(r.disputed()).isEqualByComparingTo("500.00");
        assertThat(r.release()).isEqualByComparingTo("1499.50");
    }

    @Test
    void sameUtrTwiceInTheStatementCountsOnce() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "5000", null,
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1"), credit("2026-10-14", "2000", "U1"))));
        assertThat(r.disputed()).isEqualByComparingTo("2000");
    }

    @Test
    void debitWithTheSameAmountIsIgnored() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "5000", null,
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(debit("2026-10-13", "2000", "U1"))));
        assertThat(r.unsure()).isTrue();
        assertThat(r.disputed()).isEqualByComparingTo("2000");
    }

    @Test
    void unknownFreezeTypeIsUnsure() {
        MoneyResult r = tracer.trace(input(FreezeType.UNKNOWN, null, "10000",
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1"))));
        assertThat(r.unsure()).isTrue();
    }

    @Test
    void everyProblemHasPlainWordsAndARuleRef() {
        MoneyInput worst = new MoneyInput(FreezeType.WHOLE_ACCOUNT, m("1000"), m("500"),
                List.of(payment("U1", "2026-10-13", "2000")),
                List.of(credit("2026-10-13", "2000", "U1")),
                null, null, null, true, true, 2, TODAY.minusDays(95), TODAY);
        MoneyResult r = tracer.trace(worst);
        assertThat(r.problems()).isNotEmpty();
        for (Problem p : r.problems()) {
            assertThat(p.text()).isNotBlank();
            assertThat(p.ruleRef()).isNotBlank();
        }
    }

    @Test
    void resultListIsNeverNull() {
        MoneyResult r = tracer.trace(input(FreezeType.UNKNOWN, null, null, List.of(), List.of()));
        assertThat(r.problems()).isNotNull();
        assertThat(r.disputed()).isEqualByComparingTo("0.00");
        assertThat(r.frozen()).isEqualByComparingTo("0.00");
        assertThat(r.release()).isEqualByComparingTo("0.00");
    }

    @Test
    void withoutAStatementTheNoticeAmountsAreTrusted() {
        MoneyResult r = tracer.trace(input(FreezeType.AMOUNT_HOLD, "2000", null,
                List.of(payment("U1", "2026-10-13", "2000")), List.of()));
        assertThat(r.disputed()).isEqualByComparingTo("2000");
        assertThat(r.release()).isEqualByComparingTo("0.00");
    }
}
