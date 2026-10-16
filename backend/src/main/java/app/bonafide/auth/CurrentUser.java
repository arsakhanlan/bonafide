package app.bonafide.auth;

/** The logged-in person, put on the request by the auth filter after verifying the Firebase token. */
public record CurrentUser(String uid) {

    public static final String REQUEST_ATTRIBUTE = "bonafide.currentUser";
}
