package app.bonafide.documents;

import app.bonafide.config.BonafideProperties;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class GcsFileStore implements FileStore {

    private final Storage storage;
    private final String bucket;

    public GcsFileStore(Storage storage, BonafideProperties properties) {
        this.storage = storage;
        this.bucket = properties.bucket();
    }

    @Override
    public byte[] read(String path) {
        Blob blob = storage.get(BlobId.of(bucket, path));
        if (blob == null) {
            throw new IllegalArgumentException("File not found: " + path);
        }
        return blob.getContent();
    }

    @Override
    public void deletePrefix(String prefix) {
        for (Blob blob : storage.list(bucket, com.google.cloud.storage.Storage.BlobListOption.prefix(prefix)).iterateAll()) {
            storage.delete(blob.getBlobId());
        }
    }
}
