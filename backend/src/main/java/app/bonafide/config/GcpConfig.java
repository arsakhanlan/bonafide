package app.bonafide.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/** The Google Cloud clients, created as plain beans (no Spring Cloud GCP). Off in the test profile. */
@Configuration
@Profile("!test")
public class GcpConfig {

    private static String projectId() {
        String project = System.getenv("GOOGLE_CLOUD_PROJECT");
        return project == null || project.isBlank() ? "bonafide-cup-2026" : project;
    }

    private static GoogleCredentials credentials() throws IOException {
        return GoogleCredentials.getApplicationDefault();
    }

    @Bean(destroyMethod = "close")
    public Firestore firestore() throws IOException {
        return FirestoreOptions.newBuilder()
                .setProjectId(projectId())
                .setCredentials(credentials())
                .build()
                .getService();
    }

    @Bean
    public Storage storage() throws IOException {
        return StorageOptions.newBuilder()
                .setProjectId(projectId())
                .setCredentials(credentials())
                .build()
                .getService();
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        FirebaseOptions options = FirebaseOptions.builder()
                .setProjectId(projectId())
                .setCredentials(credentials())
                .build();
        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp app) {
        return FirebaseAuth.getInstance(app);
    }
}
