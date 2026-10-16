package app.bonafide.demo;

import app.bonafide.cases.Case;
import app.bonafide.cases.CaseService;
import app.bonafide.config.BonafideProperties;
import app.bonafide.documents.FileStore;
import app.bonafide.events.Event;
import app.bonafide.events.EventDispatcher;
import app.bonafide.events.EventRepository;
import app.bonafide.events.EventType;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/** Judges' demo mode: a fake case with fake papers, created in one call (BUILD_SPEC §16). */
@Service
public class DemoService {

    private final CaseService cases;
    private final DemoPapers demoPapers;
    private final FileStore files;
    private final EventRepository events;
    private final EventDispatcher dispatcher;
    private final BonafideProperties properties;
    private final Clock clock;

    public DemoService(
            CaseService cases,
            DemoPapers demoPapers,
            FileStore files,
            EventRepository events,
            EventDispatcher dispatcher,
            BonafideProperties properties,
            Clock clock) {
        this.cases = cases;
        this.demoPapers = demoPapers;
        this.files = files;
        this.events = events;
        this.dispatcher = dispatcher;
        this.properties = properties;
        this.clock = clock;
    }

    public Case create(String uid, String persona) {
        if (!properties.demoMode()) {
            throw new DemoOff();
        }
        DemoPapers.Persona loaded = demoPapers.load(persona.toLowerCase());
        LocalDate today = LocalDate.now(clock);
        Case case_ = cases.create(uid, "en", Map.of("persona", persona, "today", today.toString()));

        List<Map<String, String>> fileRefs = new ArrayList<>();
        int n = 0;
        for (Map<String, Object> paper : loaded.papers()) {
            String fileName = "a" + (++n) + "-" + paper.get("file");
            String path = "uploads/" + uid + "/" + case_.id() + "/" + fileName;
            files.write(path, (byte[]) paper.get("content"), (String) paper.get("mime"));
            fileRefs.add(Map.of("path", path, "kind", (String) paper.get("kind"), "mime", (String) paper.get("mime")));
        }

        Event event = Event.newPending(case_.id(), EventType.UPLOAD,
                Map.of("files", fileRefs, "text", loaded.note()), clock.instant());
        events.createPendingIfFree(case_.id(), uid, event);
        dispatcher.dispatch(case_.id(), event.id());
        return case_;
    }

    public static class DemoOff extends RuntimeException {
    }
}
