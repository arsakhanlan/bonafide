package app.bonafide;

import app.bonafide.support.TestFakes;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestFakes.class)
class BonafideApplicationTests {

    @Test
    void contextLoads() {
    }
}
