package app.bonafide.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "bonafide")
public record BonafideProperties(
        @DefaultValue("asia-southeast1") String region,
        @DefaultValue("") String bucket,
        @DefaultValue("gemini-3.8-flash") String modelMain,
        @DefaultValue("gemini-3.5-flash-lite") String modelSmall,
        @DefaultValue("gemini-embedding-2") String embedModel,
        @DefaultValue("") String modelArmorTemplate,
        @DefaultValue("0.6") double groundingMin,
        @DefaultValue("true") boolean demoMode,
        @DefaultValue("") String serviceUrl,
        @DefaultValue("") String schedulerSa) {
}
