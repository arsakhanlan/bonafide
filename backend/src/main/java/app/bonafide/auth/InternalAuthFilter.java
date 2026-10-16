package app.bonafide.auth;

import app.bonafide.api.ErrorResponses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** /internal/** accepts only Google-signed calls (Cloud Scheduler) — never public callers. */
@Component
@Profile("!test")
public class InternalAuthFilter extends OncePerRequestFilter {

    private final OidcVerifier verifier;

    public InternalAuthFilter(OidcVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/internal/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ") || !verifier.verify(header.substring("Bearer ".length()))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getOutputStream().write(ErrorResponses.bytes("UNAUTHENTICATED", "Google-signed token required."));
            return;
        }
        chain.doFilter(request, response);
    }
}
