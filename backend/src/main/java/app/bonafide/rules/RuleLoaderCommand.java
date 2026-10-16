package app.bonafide.rules;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Profile load-rules: load the library into Firestore and exit. */
@Component
@Profile("load-rules")
public class RuleLoaderCommand implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(RuleLoaderCommand.class);

    private final RuleLoader loader;

    public RuleLoaderCommand(RuleLoader loader) {
        this.loader = loader;
    }

    @Override
    public void run(String... args) throws Exception {
        int saved = loader.load();
        log.info("Rule library loaded: {} chunks", saved);
    }
}
