package app.bonafide.auth;

import app.bonafide.api.ErrorResponses;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Every /api/** call must carry a valid Firebase ID token; 401 otherwise (contract §2). */
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthFilter(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            reject(response, "Missing login token.");
            return;
        }
        try {
            FirebaseToken token = firebaseAuth.verifyIdToken(header.substring("Bearer ".length()));
            request.setAttribute(CurrentUser.REQUEST_ATTRIBUTE, new CurrentUser(token.getUid()));
            chain.doFilter(request, response);
        } catch (FirebaseAuthException | IllegalArgumentException e) {
            reject(response, "Login token is not valid.");
        }
    }

    private static void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getOutputStream().write(ErrorResponses.bytes("UNAUTHENTICATED", message));
    }
}
