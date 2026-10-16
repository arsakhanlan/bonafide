package app.bonafide.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TimeConfig {

    public static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    @Bean
    public Clock clock() {
        return Clock.system(INDIA);
    }
}
