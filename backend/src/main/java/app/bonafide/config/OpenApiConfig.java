package app.bonafide.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI bonafideOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Bonafide API")
                        .version("0.1.0")
                        .description("Long-running AI case agent helping innocent people in India get wrongly frozen bank accounts released under BNSS §106 and MHA Cyber SOP.")
                        .contact(new Contact().name("Bonafide Team").url("https://github.com/arsakhanlan/bonafide")))
                .servers(List.of(
                        new Server().url("/").description("Current Server"),
                        new Server().url("http://localhost:8080").description("Local Backend")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Firebase Auth ID token passed as Bearer <token>")));
    }
}

