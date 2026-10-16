package app.bonafide.deadlines;

import app.bonafide.deadlines.Deadline.Status;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Plain-code clocks (BUILD_SPEC §12): start from letters and milestones, meet and cancel
 * on replies, and a due date counts as the end of that day in India time.
 */
@Component
public class DeadlineEngine {

    private final DeadlineStore store;
    private final ClockCatalog catalog;

    public DeadlineEngine(DeadlineStore store, ClockCatalog catalog) {
        this.store = store;
        this.catalog = catalog;
    }

    /** Starts every clock the trigger owns; each deadline's id is the clock, so repeats are harmless. */
    public List<Deadline> start(String caseId, String uid, String trigger, LocalDate on, boolean demo) {
        List<Deadline> started = new ArrayList<>();
        for (ClockRule rule : catalog.byTrigger(trigger)) {
            Deadline deadline = new Deadline(
                    rule.clock(), rule.who(), rule.title(), on, on.plusDays(rule.days()),
                    Status.PENDING, rule.ruleRef(), demo, caseId, uid);
            store.put(caseId, deadline);
            started.add(deadline);
        }
        return started;
    }

    /** A milestone arrives: meet, cancel or start the clocks it owns. */
    public List<Deadline> apply(String caseId, String milestone, LocalDate on) {
        return switch (milestone) {
            case "BANK_FILED" -> {
                store.markStatus(caseId, "BANK_FILE_GRIEVANCE", Status.MET);
                var case_ = store.findAll(caseId);
                boolean demo = case_.stream().anyMatch(Deadline::demo);
                String uid = case_.stream().map(Deadline::uid).findFirst().orElse(null);
                yield start(caseId, uid, "milestone:BANK_FILED", on, demo);
            }
            case "HOLD_LIMITED" -> {
                store.markStatus(caseId, "OFFICER_DECIDE", Status.CANCELLED);
                store.markStatus(caseId, "DISTRICT_OFFICER_DECIDE", Status.CANCELLED);
                yield List.of();
            }
            case "FULLY_RELEASED" -> {
                List<Deadline> changed = new ArrayList<>();
                for (Deadline deadline : store.findAll(caseId)) {
                    if (deadline.status() == Status.PENDING) {
                        store.markStatus(caseId, deadline.clock(), Status.CANCELLED);
                        changed.add(deadline);
                    }
                }
                yield changed;
            }
            case "OFFICER_SILENT" -> start(caseId, uidOf(caseId), "milestone:OFFICER_SILENT", on, isDemo(caseId));
            default -> List.of();
        };
    }

    /** A deadline is missed only after its due day ends: today.isAfter(dueOn). */
    public List<Deadline> missed(String caseId, LocalDate today) {
        return store.findAll(caseId).stream()
                .filter(d -> d.status() == Status.PENDING && today.isAfter(d.dueOn()))
                .toList();
    }

    public java.util.Optional<LocalDate> earliestPendingDueOn(String caseId) {
        return store.findAll(caseId).stream()
                .filter(d -> d.status() == Status.PENDING)
                .map(Deadline::dueOn)
                .min(LocalDate::compareTo);
    }

    public List<Deadline> all(String caseId) {
        return store.findAll(caseId);
    }

    private String uidOf(String caseId) {
        return store.findAll(caseId).stream().map(Deadline::uid).findFirst().orElse(null);
    }

    private boolean isDemo(String caseId) {
        return store.findAll(caseId).stream().anyMatch(Deadline::demo);
    }
}
