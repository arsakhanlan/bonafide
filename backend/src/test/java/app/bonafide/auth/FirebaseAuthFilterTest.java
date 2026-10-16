package app.bonafide.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class FirebaseAuthFilterTest {

    private final FirebaseAuth firebaseAuth = mock(FirebaseAuth.class);
    private final FilterChain chain = mock(FilterChain.class);
    private final FirebaseAuthFilter filter = new FirebaseAuthFilter(firebaseAuth);

    @BeforeEach
    void validToken() throws Exception {
        FirebaseToken token = mock(FirebaseToken.class);
        when(token.getUid()).thenReturn("u1");
        when(firebaseAuth.verifyIdToken(anyString())).thenReturn(token);
    }

    @Test
    void withoutATokenItAnswers401AndStops() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest("POST", "/api/cases"), response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("UNAUTHENTICATED");
        verifyNoInteractions(chain);
    }

    @Test
    void withABadTokenItAnswers401() throws Exception {
        when(firebaseAuth.verifyIdToken(anyString())).thenThrow(mock(FirebaseAuthException.class));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/cases");
        request.addHeader("Authorization", "Bearer nope");

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void withAValidTokenItPutsTheUserOnTheRequestAndContinues() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/cases");
        request.addHeader("Authorization", "Bearer good");

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        CurrentUser user = (CurrentUser) request.getAttribute(CurrentUser.REQUEST_ATTRIBUTE);
        assertThat(user.uid()).isEqualTo("u1");
        verify(chain).doFilter(any(), any());
    }

    @Test
    void nonApiPathsAreSkipped() {
        assertThat(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/actuator/health"))).isTrue();
        assertThat(filter.shouldNotFilter(new MockHttpServletRequest("POST", "/api/cases"))).isFalse();
    }
}
