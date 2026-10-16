package app.bonafide.agents;

import static org.assertj.core.api.Assertions.assertThat;

import app.bonafide.agents.SorterPolicy.Verdict;
import app.bonafide.agents.outputs.SorterOutput;
import java.util.List;
import org.junit.jupiter.api.Test;

class SorterPolicyTest {

    private static SorterOutput sorter(String status, boolean accused, List<SorterOutput.Question> questions,
                                       String caseType) {
        return new SorterOutput(status, List.of("reason"), questions, caseType, accused);
    }

    @Test
    void genuineShopsContinue() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("GENUINE", false, List.of(), "SHOP_UPI"), true);
        assertThat(decision.verdict()).isEqualTo(Verdict.CONTINUE);
        assertThat(decision.cautions()).isEmpty();
    }

    @Test
    void lentAccountGoesToDlsaWithNoLetters() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("LENT_ACCOUNT", false, List.of(), "OTHER"), false);
        assertThat(decision.verdict()).isEqualTo(Verdict.REFERRED_DLSA);
        assertThat(decision.referral()).containsEntry("to", "DLSA");
        assertThat((String) decision.referral().get("link")).startsWith("https://nalsa.gov.in");
    }

    @Test
    void victimsGoToTheCyberHelpline() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("VICTIM", false, List.of(), "OTHER"), false);
        assertThat(decision.verdict()).isEqualTo(Verdict.REFERRED_VICTIM);
        assertThat((String) decision.referral().get("link")).startsWith("https://cybercrime.gov.in");
    }

    @Test
    void accusedPeopleNeedALawyerEvenWhenGenuine() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("GENUINE", true, List.of(), "SHOP_UPI"), false);
        assertThat(decision.verdict()).isEqualTo(Verdict.NEEDS_LAWYER);
    }

    @Test
    void unclearAsksQuestionsOnlyOnce() {
        SorterOutput withQuestions = sorter("UNCLEAR", false,
                List.of(new SorterOutput.Question("q1", "Was this for goods or work?", List.of("Yes", "No"))),
                "OTHER");
        assertThat(SorterPolicy.decide(withQuestions, false).verdict()).isEqualTo(Verdict.NEEDS_ANSWERS);
        assertThat(SorterPolicy.decide(withQuestions, true).verdict()).isEqualTo(Verdict.CONTINUE);
    }

    @Test
    void unclearWithoutQuestionsContinuesWithACaution() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("UNCLEAR", false, List.of(), "OTHER"), false);
        assertThat(decision.verdict()).isEqualTo(Verdict.CONTINUE);
        assertThat(decision.cautions()).anyMatch(c -> c.contains("legal aid"));
    }

    @Test
    void cryptoP2pAddsTheTradingCaution() {
        SorterPolicy.Decision decision = SorterPolicy.decide(sorter("GENUINE", false, List.of(), "CRYPTO_P2P"), false);
        assertThat(decision.verdict()).isEqualTo(Verdict.CONTINUE);
        assertThat(decision.cautions()).anyMatch(c -> c.contains("P2P"));
    }
}
