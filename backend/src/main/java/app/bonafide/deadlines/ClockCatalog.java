package app.bonafide.deadlines;

import java.io.IOException;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/** Loads clocks.json. Draft rules are loaded but never create deadlines. */
@Component
public class ClockCatalog {

    private final List<ClockRule> rules;

    public ClockCatalog() {
        try {
            this.rules = new JsonMapper().readValue(
                    new ClassPathResource("clocks.json").getInputStream(),
                    new tools.jackson.core.type.TypeReference<List<ClockRule>>() {});
        } catch (IOException e) {
            throw new IllegalStateException("clocks.json is missing or unreadable", e);
        }
    }

    /** All in-force clocks that start on the given trigger, e.g. "milestone:BANK_FILED". */
    public List<ClockRule> byTrigger(String trigger) {
        return rules.stream()
                .filter(r -> r.inForce() && trigger.equals(r.startedBy()))
                .toList();
    }

    public List<ClockRule> all() {
        return rules;
    }
}
