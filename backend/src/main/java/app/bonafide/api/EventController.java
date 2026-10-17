package app.bonafide.api;

import app.bonafide.auth.CurrentUser;
import app.bonafide.cases.CaseService;
import app.bonafide.events.Event;
import app.bonafide.events.EventDispatcher;
import app.bonafide.events.EventRepository;
import app.bonafide.events.EventType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Clock;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cases/{caseId}/events")
public class EventController {

    private final CaseService cases;
    private final EventRepository events;
    private final EventDispatcher dispatcher;
    private final Clock clock;

    public EventController(CaseService cases, EventRepository events, EventDispatcher dispatcher, Clock clock) {
        this.cases = cases;
        this.events = events;
        this.dispatcher = dispatcher;
        this.clock = clock;
    }

    private static final java.util.Set<String> ALLOWED_MIMES =
            java.util.Set.of("image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain");

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> send(
            @RequestAttribute(CurrentUser.REQUEST_ATTRIBUTE) CurrentUser user,
            @PathVariable String caseId,
            @Valid @RequestBody SendEventRequest request) {
        if (request.files() != null) {
            String prefix = "uploads/" + user.uid() + "/" + caseId + "/";
            for (SendEventRequest.FileRef file : request.files()) {
                if (!file.path().startsWith(prefix)) {
                    throw new IllegalArgumentException("Files must be under " + prefix);
                }
                if (!ALLOWED_MIMES.contains(file.mime())) {
                    throw new IllegalArgumentException("File type not allowed: " + file.mime());
                }
            }
        }
        Event event = Event.newPending(caseId, request.type(), payload(request), clock.instant());
        return switch (events.createPendingIfFree(caseId, user.uid(), event)) {
            case CREATED -> {
                dispatcher.dispatch(caseId, event.id());
                yield Map.of("eventId", event.id());
            }
            case BUSY -> throw new Busy();
            case NOT_FOUND -> throw new CaseService.NotFound();
        };
    }

    private static Map<String, Object> payload(SendEventRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("files", request.files() == null ? List.of() : request.files());
        payload.put("text", request.text());
        payload.put("answers", request.answers());
        return payload;
    }

    public record SendEventRequest(
            @NotNull EventType type,
            @Size(max = 10, message = "at most 10 files per event") List<FileRef> files,
            String text,
            List<Answer> answers) {

        public record FileRef(
                @NotBlank String path,
                @NotBlank String kind,
                @NotBlank String mime) {
        }

        public record Answer(@NotBlank String questionId, @NotBlank String answer) {
        }
    }
}
