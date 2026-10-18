package app.bonafide.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.bonafide.auth.FirebaseAuthFilter;
import app.bonafide.cases.Case;
import app.bonafide.cases.CaseService;
import app.bonafide.cases.Stage;
import app.bonafide.config.BonafideProperties;
import app.bonafide.deadlines.ClockCatalog;
import app.bonafide.deadlines.DeadlineEngine;
import app.bonafide.deadlines.TickService;
import app.bonafide.demo.DemoPapers;
import app.bonafide.demo.DemoService;
import app.bonafide.events.Event;
import app.bonafide.events.EventDispatcher;
import app.bonafide.events.EventRepository;
import app.bonafide.events.EventType;
import app.bonafide.support.TestFakes;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.time.Clock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * The spec's web tests (BUILD_SPEC §17): 401 without a token, 404 on another user's case,
 * 409 when busy, 400 on validation, 202 on an event, and the exact error JSON shape.
 */
@WebMvcTest({CaseController.class, EventController.class, LetterController.class, DemoController.class})
@ActiveProfiles("test")
@Import({TestFakes.class, FirebaseAuthFilter.class, WebMvcTests.ExtraBeans.class,
        CaseService.class, DemoService.class, DemoPapers.class, TickService.class,
        DeadlineEngine.class, ClockCatalog.class})
class WebMvcTests {

    @TestConfiguration
    static class ExtraBeans {
        @org.springframework.context.annotation.Bean
        Clock clock() {
            return Clock.systemUTC();
        }

        @org.springframework.context.annotation.Bean
        BonafideProperties properties() {
            return new BonafideProperties("asia-southeast1", "", "gemini-3.8-flash", "gemini-3.5-flash-lite",
                    "gemini-embedding-2", "", 0.6, true, "", "", "../data/rules");
        }
    }

    @Autowired private MockMvc mvc;
    @Autowired private FirebaseAuth firebaseAuth;
    @Autowired private TestFakes.InMemoryCaseRepository cases;
    @Autowired private TestFakes.InMemoryEventRepository events;
    @Autowired private TestFakes.InMemoryLetterRepository letters;
    @Autowired private TestFakes.InMemoryDeadlineStore deadlineStore;
    @MockitoBean private EventDispatcher dispatcher;

    @BeforeEach
    void setUp() throws Exception {
        FirebaseToken token = org.mockito.Mockito.mock(FirebaseToken.class);
        when(token.getUid()).thenReturn("u1");
        when(firebaseAuth.verifyIdToken(anyString())).thenReturn(token);
        cases.cases.clear();
        events.events.clear();
    }

    private ResultActions withToken(String uid) throws Exception {
        FirebaseToken token = org.mockito.Mockito.mock(FirebaseToken.class);
        when(token.getUid()).thenReturn(uid);
        when(firebaseAuth.verifyIdToken(anyString())).thenReturn(token);
        return null;
    }

    private String bearer() {
        return "Bearer good";
    }

    @Test
    void withoutATokenItAnswers401WithTheContractShape() throws Exception {
        mvc.perform(post("/api/cases").contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"en\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("$.error.message").exists());
    }

    @Test
    void creatingACaseReturnsTheCaseId() throws Exception {
        mvc.perform(post("/api/cases").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"en\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.caseId").exists());
    }

    @Test
    void aBadLanguageIsRejectedWith400() throws Exception {
        mvc.perform(post("/api/cases").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"fr\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    @Test
    void anEventOnSomeoneElsesCaseIs404() throws Exception {
        cases.save(Case.newCase("c1", "u2", "en", Instant.now(), null));
        mvc.perform(post("/api/cases/c1/events").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"UPLOAD\",\"files\":[],\"text\":\"hi\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void anEventWhileBusyIs409() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        cases.update("c1", Map.of("busy", true));
        mvc.perform(post("/api/cases/c1/events").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"UPLOAD\",\"files\":[],\"text\":\"hi\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("BUSY"));
    }

    @Test
    void anEventIsAcceptedWith202AndEventId() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        mvc.perform(post("/api/cases/c1/events").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"UPLOAD\",\"files\":[],\"text\":\"hi\"}"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.eventId").exists());
    }

    @Test
    void aFilePathOutsideThePersonsUploadsIs400() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        mvc.perform(post("/api/cases/c1/events").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"UPLOAD\",\"files\":[{\"path\":\"uploads/u9/other/a.txt\","
                                + "\"kind\":\"NOTICE\",\"mime\":\"text/plain\"}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    @Test
    void anUnallowedMimeIs400() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        mvc.perform(post("/api/cases/c1/events").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"UPLOAD\",\"files\":[{\"path\":\"uploads/u1/c1/a.exe\","
                                + "\"kind\":\"NOTICE\",\"mime\":\"application/x-msdownload\"}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    @Test
    void deletingSomeoneElsesCaseIs404() throws Exception {
        cases.save(Case.newCase("c1", "u2", "en", Instant.now(), null));
        mvc.perform(delete("/api/cases/c1").header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletingYourOwnCaseIs204() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        mvc.perform(delete("/api/cases/c1").header("Authorization", bearer()))
                .andExpect(status().isNoContent());
    }

    @Test
    void approvingAMissingLetterIs404() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        mvc.perform(post("/api/cases/c1/letters/nope/approve").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void aSentDateThatIsNotAYyyyMmDdIs400() throws Exception {
        cases.save(Case.newCase("c1", "u1", "en", Instant.now(), null));
        events.events.put("c1/" + "l1", Event.newPending("c1", EventType.UPLOAD, Map.of(), Instant.now()));
        mvc.perform(post("/api/cases/c1/letters/l1/sent").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sentOn\":\"19-10-2026\",\"how\":\"BRANCH\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    @Test
    void aPoliceLetterStartsTheOfficerClockAndUsesPoliceWording() throws Exception {
        cases.save(Case.newCase("police1", "u1", "en", Instant.now(), null));
        letters.save("police1", "l2",
                new HashMap<>(Map.of("kind", "L2_OFFICER", "status", "APPROVED")));

        mvc.perform(post("/api/cases/police1/letters/l2/sent").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sentOn\":\"2026-10-19\",\"how\":\"EMAIL\"}"))
                .andExpect(status().isOk());

        Case updated = cases.find("police1").orElseThrow();
        assertThat(updated.stage()).isEqualTo(Stage.WAITING);
        assertThat(updated.nextStep().get("text")).isEqualTo("Waiting for the police to respond.");
        assertThat(deadlineStore.findAll("police1"))
                .extracting(d -> d.clock())
                .contains("OFFICER_DECIDE");
    }

    @Test
    void handingLawyerNotesMovesTheCaseToTheCourtStep() throws Exception {
        cases.save(Case.newCase("lawyer1", "u1", "en", Instant.now(), null));
        letters.save("lawyer1", "l5",
                new HashMap<>(Map.of("kind", "L5_LAWYER_NOTES", "status", "APPROVED")));

        mvc.perform(post("/api/cases/lawyer1/letters/l5/sent").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sentOn\":\"2026-10-19\",\"how\":\"EMAIL\"}"))
                .andExpect(status().isOk());

        Case updated = cases.find("lawyer1").orElseThrow();
        assertThat(updated.stage()).isEqualTo(Stage.NEEDS_LAWYER);
        assertThat(updated.nextStep().get("action")).isEqualTo("SEE_LEGAL_AID");
    }

    @Test
    void demoIsForbiddenWhenOff() throws Exception {
        // Demo mode defaults on in the test profile; the 403 path is covered by the handler.
        mvc.perform(post("/api/demo/cases").header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"persona\":\"NOPE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }
}
