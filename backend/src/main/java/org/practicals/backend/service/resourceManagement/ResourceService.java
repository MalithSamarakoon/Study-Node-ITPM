package org.practicals.backend.service.resourceManagement;

import org.practicals.backend.model.moduleManagement.Module;
import org.practicals.backend.model.notificationManagement.NotificationType;
import org.practicals.backend.model.resourceManagement.Resource;
import org.practicals.backend.model.resourceManagement.ResourceStatus;
import org.practicals.backend.model.resourceManagement.ResourceType;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.moduleManagement.ModuleRepository;
import org.practicals.backend.repository.resourceManagement.ResourceRepository;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.practicals.backend.service.notificationManagement.NotificationService;
import org.practicals.backend.service.storageManagement.FileStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public ResourceService(ResourceRepository resourceRepository,
                           ModuleRepository moduleRepository,
                           UserRepository userRepository,
                           NotificationService notificationService,
                           FileStorageService fileStorageService) {
        this.resourceRepository = resourceRepository;
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    public Resource upload(String title,
                           String description,
                           Long moduleId,
                           int year,
                           int semester,
                           ResourceType fileType,
                           MultipartFile file,
                           MultipartFile thumbnail,
                           MultipartFile videoMaterialPdf) {

        Long userId = getCurrentUserId();
        User uploader = userRepository.findById(userId).orElseThrow();

        Module module = moduleRepository.findById(moduleId).orElseThrow();

        var stored = fileStorageService.store(file, "resources");
        String url = "/files/resources/" + stored.storedName();

        if (fileType == ResourceType.VIDEO) {
            if (thumbnail == null || thumbnail.isEmpty()) {
                throw new IllegalArgumentException("Thumbnail is required for video resources");
            }
            if (videoMaterialPdf == null || videoMaterialPdf.isEmpty()) {
                throw new IllegalArgumentException("Video material PDF is required for video resources");
            }
            String materialContentType = videoMaterialPdf.getContentType();
            String materialName = videoMaterialPdf.getOriginalFilename();
            boolean isPdfByType = materialContentType != null && materialContentType.toLowerCase().contains("pdf");
            boolean isPdfByName = materialName != null && materialName.toLowerCase().endsWith(".pdf");
            if (!isPdfByType && !isPdfByName) {
                throw new IllegalArgumentException("Video material must be a PDF file");
            }
        }

        String thumbnailUrl = null;
        if (thumbnail != null && !thumbnail.isEmpty()) {
            var storedThumb = fileStorageService.store(thumbnail, "thumbnails");
            thumbnailUrl = "/files/thumbnails/" + storedThumb.storedName();
        }

        String videoMaterialPdfUrl = null;
        if (videoMaterialPdf != null && !videoMaterialPdf.isEmpty()) {
            var storedMaterialPdf = fileStorageService.store(videoMaterialPdf, "video-materials");
            videoMaterialPdfUrl = "/files/video-materials/" + storedMaterialPdf.storedName();
        }

        Resource r = Resource.builder()
                .title(title)
                .description(description)
                .module(module)
                .year(year)
                .semester(semester)
                .fileType(fileType)
                .fileName(stored.originalName())
                .fileUrl(url)
                .thumbnailUrl(thumbnailUrl)
                .videoMaterialPdfUrl(videoMaterialPdfUrl)
                .status(ResourceStatus.PENDING)
                .uploadedBy(uploader)
                .build();

        return resourceRepository.save(r);
    }

    public Resource updateMyPending(Long id, String title, String description) {
        Long userId = getCurrentUserId();
        Resource r = resourceRepository.findById(id).orElseThrow();

        if (!r.getUploadedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own resources");
        }
        if (r.getStatus() != ResourceStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING resources can be edited");
        }

        r.setTitle(title);
        r.setDescription(description);
        return resourceRepository.save(r);
    }

    public void deleteMyPending(Long id) {
        Long userId = getCurrentUserId();
        Resource r = resourceRepository.findById(id).orElseThrow();

        if (!r.getUploadedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own resources");
        }
        if (r.getStatus() != ResourceStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING resources can be deleted");
        }

        resourceRepository.delete(r);
    }

    public Page<Resource> myUploads(Pageable pageable) {
        Long userId = getCurrentUserId();
        return resourceRepository.findByUploadedById(userId, pageable);
    }

    public Page<Resource> approvalQueue(Pageable pageable) {
        return resourceRepository.findByStatus(ResourceStatus.PENDING, pageable);
    }

    public Resource decide(Long resourceId, boolean approve, String rejectionReason) {
        Long adminId = getCurrentUserId();
        User admin = userRepository.findById(adminId).orElseThrow();

        Resource r = resourceRepository.findById(resourceId).orElseThrow();
        if (r.getStatus() != ResourceStatus.PENDING) {
            throw new IllegalArgumentException("Resource is already decided");
        }

        if (approve) {
            r.setStatus(ResourceStatus.APPROVED);
            r.setApprovedBy(admin);
            r.setRejectionReason(null);

            notificationService.notify(
                    r.getUploadedBy(),
                    "Resource approved",
                    "Your resource '" + r.getTitle() + "' was approved.",
                    NotificationType.APPROVAL
            );
        } else {
            r.setStatus(ResourceStatus.REJECTED);
            r.setApprovedBy(admin);
            r.setRejectionReason(rejectionReason);

            notificationService.notify(
                    r.getUploadedBy(),
                    "Resource rejected",
                    "Your resource '" + r.getTitle() + "' was rejected. Reason: " + (rejectionReason == null ? "-" : rejectionReason),
                    NotificationType.REJECTION
            );
        }

        return resourceRepository.save(r);
    }

    public void adminRemove(Long id) {
        Resource r = resourceRepository.findById(id).orElseThrow();
        resourceRepository.delete(r);
    }

    public Page<Resource> publicResources(Long moduleId, int year, int semester, Pageable pageable) {
        return resourceRepository.findByModuleIdAndYearAndSemesterAndStatus(moduleId, year, semester, ResourceStatus.APPROVED, pageable);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    public Page<Resource> adminApprovedResources(Long moduleId, Integer year, Integer semester, Pageable pageable) {
        if (moduleId != null && year != null && semester != null) {
            return resourceRepository.findByModuleIdAndYearAndSemesterAndStatusOrderByCreatedAtDesc(
                    moduleId, year, semester, ResourceStatus.APPROVED, pageable);
        }
        if (moduleId != null) {
            return resourceRepository.findByModuleIdAndStatusOrderByCreatedAtDesc(
                    moduleId, ResourceStatus.APPROVED, pageable);
        }
        return resourceRepository.findByStatusOrderByCreatedAtDesc(ResourceStatus.APPROVED, pageable);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }
}
