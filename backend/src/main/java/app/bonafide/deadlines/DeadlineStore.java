package app.bonafide.deadlines;

import java.util.List;

/** Port over the deadlines collection. */
public interface DeadlineStore {

    /** Put by clock id; replacing makes starting the same clock twice harmless. */
    void put(String caseId, Deadline deadline);

    List<Deadline> findAll(String caseId);

    void markStatus(String caseId, String clock, Deadline.Status status);

    /** The tick's collection-group sweep: PENDING deadlines whose due day has ended. */
    List<Deadline> findMissed(java.time.LocalDate today);
}
