package app.bonafide.documents;

/** Port over Cloud Storage for the person's uploads (and demo copies). */
public interface FileStore {

    byte[] read(String path);

    void write(String path, byte[] content, String mime);

    void deletePrefix(String prefix);
}
