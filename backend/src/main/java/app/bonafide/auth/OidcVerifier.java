package app.bonafide.auth;

import app.bonafide.config.BonafideProperties;
import com.google.auth.oauth2.TokenVerifier;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Checks Google-signed OIDC tokens for /internal/** (the scheduler's own identity). */
@Component
@Profile("!test")
public class OidcVerifier {

    private final TokenVerifier verifier;

    public OidcVerifier(BonafideProperties properties) {
        this.verifier = TokenVerifier.newBuilder()
                .setAudience(properties.serviceUrl())
                .build();
    }

    public boolean verify(String token) {
        try {
            verifier.verify(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
