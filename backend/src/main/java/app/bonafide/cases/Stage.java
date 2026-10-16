package app.bonafide.cases;

/** What the person should look at now (contract §5.2). */
public enum Stage {
    NEW,
    NEEDS_ANSWERS,
    LETTER_READY,
    WAITING,
    PARTLY_RELEASED,
    RESOLVED,
    REFERRED,
    NEEDS_LAWYER,
    FAILED
}
