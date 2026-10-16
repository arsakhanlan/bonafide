package app.bonafide.documents;

/** Port over Cloud Storage for the person's uploads. */
public interface FileStore {

    byte[] read(String path);

    void deletePrefix(String prefix);
}
