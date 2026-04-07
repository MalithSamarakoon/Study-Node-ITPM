package org.practicals.backend.service.storageManagement;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${app.storage.root}") String rootDir) {
        this.root = Paths.get(rootDir).toAbsolutePath().normalize();
    }

    public StoredFile store(MultipartFile file, String subFolder) {
        try {
            Files.createDirectories(root.resolve(subFolder));

            String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
            String ext = "";
            int idx = original.lastIndexOf('.');
            if (idx > 0) ext = original.substring(idx);

            String storedName = UUID.randomUUID() + ext;
            Path target = root.resolve(subFolder).resolve(storedName).normalize();

            if (!target.startsWith(root)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return new StoredFile(original, storedName, target);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public void deleteIfExists(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            Path p = Paths.get(filePath);
            Files.deleteIfExists(p);
        } catch (IOException ignored) {
        }
    }

    public record StoredFile(String originalName, String storedName, Path absolutePath) {
    }
}
