package app.bonafide.safety;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

/** Used while Model Armor is off (blank template) or during development. */
@Component
@ConditionalOnExpression("'${bonafide.model-armor-template:}'.isBlank()")
public class NoopGuard implements Guard {

    @Override
    public GuardResult check(String text) {
        return GuardResult.clean();
    }
}
