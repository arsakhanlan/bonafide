package app.bonafide.money;

import app.bonafide.rules.RuleMap;
import app.bonafide.rules.RuleMapLoader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Works out disputed vs frozen vs release, in plain code. No LLM touches money maths.
 * The matching rules are from BUILD_SPEC §11.
 */
@Component
public class MoneyTracer {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final RuleMap ruleMap;

    public MoneyTracer(RuleMapLoader loader) {
        this.ruleMap = loader.ruleMap();
    }

    public MoneyResult trace(MoneyInput in) {
        List<StatementLine> lines = in.statementLines() == null ? List.of() : in.statementLines();
        List<DisputedPayment> payments = in.disputedPayments() == null ? List.of() : in.disputedPayments();

        boolean[] lineUsed = new boolean[lines.size()];
        boolean[] paymentMatched = new boolean[payments.size()];
        List<BigDecimal> matched = new ArrayList<>();

        matchByUtr(payments, lines, lineUsed, paymentMatched, matched);
        matchByAmountAndDate(payments, lines, lineUsed, paymentMatched, matched);

        boolean unsure = in.freezeType() == FreezeType.UNKNOWN;
        BigDecimal disputed;
        if (!lines.isEmpty() && matched.isEmpty()) {
            // The statement was there but nothing matched; ask the person rather than guess.
            unsure = true;
            disputed = sum(payments.stream().map(DisputedPayment::amount).toList());
        } else if (matched.isEmpty()) {
            disputed = sum(payments.stream().map(DisputedPayment::amount).toList());
        } else {
            disputed = sum(matched);
        }

        BigDecimal frozen = frozenOf(in);
        BigDecimal release = frozen.subtract(disputed).max(ZERO);
        return new MoneyResult(
                disputed.setScale(2, RoundingMode.HALF_UP),
                frozen.setScale(2, RoundingMode.HALF_UP),
                release.setScale(2, RoundingMode.HALF_UP),
                problemsOf(in, disputed),
                unsure);
    }

    /** Match by UTR first, among credits only; each statement line counts once. */
    private static void matchByUtr(
            List<DisputedPayment> payments,
            List<StatementLine> lines,
            boolean[] lineUsed,
            boolean[] paymentMatched,
            List<BigDecimal> matched) {
        for (int i = 0; i < payments.size(); i++) {
            DisputedPayment p = payments.get(i);
            if (p.utr() == null || p.utr().isBlank()) {
                continue;
            }
            for (int j = 0; j < lines.size(); j++) {
                if (!lineUsed[j] && lines.get(j).isCredit() && p.utr().equalsIgnoreCase(lines.get(j).utr())) {
                    lineUsed[j] = true;
                    paymentMatched[i] = true;
                    matched.add(disputedAmount(p, lines.get(j)));
                    break;
                }
            }
        }
    }

    /** No UTR (or no UTR match): the same amount within ± 1 day, credits only. */
    private static void matchByAmountAndDate(
            List<DisputedPayment> payments,
            List<StatementLine> lines,
            boolean[] lineUsed,
            boolean[] paymentMatched,
            List<BigDecimal> matched) {
        for (int i = 0; i < payments.size(); i++) {
            if (paymentMatched[i]) {
                continue;
            }
            DisputedPayment p = payments.get(i);
            if (p.amount() == null || p.on() == null) {
                continue;
            }
            for (int j = 0; j < lines.size(); j++) {
                if (lineUsed[j] || !lines.get(j).isCredit()) {
                    continue;
                }
                StatementLine line = lines.get(j);
                if (line.amount().compareTo(p.amount()) == 0
                        && !line.on().isBefore(p.on().minusDays(1))
                        && !line.on().isAfter(p.on().plusDays(1))) {
                    lineUsed[j] = true;
                    paymentMatched[i] = true;
                    matched.add(disputedAmount(p, line));
                    break;
                }
            }
        }
    }

    /** The notice's own amount wins (e.g. 9,800 disputed inside a 40,000 transfer), capped at the credit. */
    private static BigDecimal disputedAmount(DisputedPayment payment, StatementLine line) {
        BigDecimal notice = payment.amount();
        if (notice == null) {
            return line.amount();
        }
        return notice.min(line.amount());
    }

    private static BigDecimal frozenOf(MoneyInput in) {
        BigDecimal frozen = switch (in.freezeType()) {
            case AMOUNT_HOLD -> in.heldAmount();
            case WHOLE_ACCOUNT -> in.balanceOnFreeze();
            case DIGITAL_BLOCK, UNKNOWN ->
                    in.heldAmount() != null ? in.heldAmount() : in.balanceOnFreeze();
        };
        return frozen == null ? ZERO : frozen;
    }

    private List<Problem> problemsOf(MoneyInput in, BigDecimal disputed) {
        List<Problem> problems = new ArrayList<>();
        if (in.freezeType() == FreezeType.WHOLE_ACCOUNT
                && in.balanceOnFreeze() != null
                && disputed.compareTo(in.balanceOnFreeze()) < 0) {
            problems.add(problem(ProblemCode.WHOLE_ACCOUNT_FROZEN));
        }
        if (in.freezeType() == FreezeType.AMOUNT_HOLD
                && in.heldAmount() != null
                && in.heldAmount().compareTo(disputed) > 0) {
            problems.add(problem(ProblemCode.HOLD_MORE_THAN_DISPUTED));
        }
        if (amountMissing(in)) {
            problems.add(problem(ProblemCode.NO_AMOUNT_GIVEN));
        }
        if (isBlank(in.officer()) || isBlank(in.complaintNo()) || isBlank(in.policeStation())) {
            problems.add(problem(ProblemCode.MISSING_DETAILS));
        }
        if (in.grievanceFiledOn() != null && in.grievanceFiledOn().plusDays(90).isBefore(in.today())) {
            problems.add(problem(ProblemCode.HOLD_TOO_LONG));
        }
        if (in.futureCreditHold() && in.layer() != null && in.layer() != 1) {
            problems.add(problem(ProblemCode.FUTURE_CREDIT_HOLD_NOT_FIRST_LAYER));
        }
        if (in.digitalBankingBlocked()) {
            problems.add(problem(ProblemCode.DIGITAL_BANKING_SUSPENDED));
        }
        if (in.balanceOnFreeze() != null && disputed.compareTo(in.balanceOnFreeze()) > 0) {
            problems.add(problem(ProblemCode.MONEY_ALREADY_MOVED));
        }
        return problems;
    }

    private static boolean amountMissing(MoneyInput in) {
        return switch (in.freezeType()) {
            case AMOUNT_HOLD -> in.heldAmount() == null;
            case WHOLE_ACCOUNT -> in.balanceOnFreeze() == null;
            case DIGITAL_BLOCK, UNKNOWN -> in.heldAmount() == null && in.balanceOnFreeze() == null;
        };
    }

    private Problem problem(ProblemCode code) {
        RuleMap.ProblemText text = ruleMap.problems().get(code);
        return new Problem(code, text.text(), text.ruleRef());
    }

    private static BigDecimal sum(List<BigDecimal> amounts) {
        return amounts.stream()
                .filter(a -> a != null)
                .reduce(ZERO, BigDecimal::add);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
