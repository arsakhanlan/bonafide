package app.bonafide.api;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openApi() {
        String scheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Bonafide API")
                        .description("Self-help case agent for wrongly frozen bank accounts. "
                                + "Every call needs a Firebase ID token; agent work happens in the background "
                                + "and the app reads the results from Firestore.")
                        .version("0.1.0"))
                .components(new Components().addSecuritySchemes(scheme, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("Firebase ID token")))
                .addSecurityItem(new SecurityRequirement().addList(scheme));
    }
}
