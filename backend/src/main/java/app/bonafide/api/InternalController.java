package app.bonafide.api;

import app.bonafide.deadlines.TickService;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Called hourly by Cloud Scheduler with a Google-signed token (checked by the auth filter). */
@RestController
@RequestMapping("/internal")
public class InternalController {

    private final TickService tick;
    private final Clock clock;

    public InternalController(TickService tick, Clock clock) {
        this.tick = tick;
        this.clock = clock;
    }

    @PostMapping("/tick")
    public Map<String, Object> tick() {
        int woken = tick.tick(LocalDate.now(clock), false);
        return Map.of("woken", woken);
    }
}
