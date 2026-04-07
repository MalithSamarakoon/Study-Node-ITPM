package org.practicals.backend.controller.resourceManagement;

import jakarta.validation.Valid;
import org.practicals.backend.dto.resourceManagement.ResourceDecisionRequest;
import org.practicals.backend.dto.resourceManagement.ResourceUpdateRequest;
import org.practicals.backend.dto.resourceManagement.ResourceUploadRequest;
import org.practicals.backend.model.resourceManagement.Resource;
import org.practicals.backend.service.resourceManagement.ResourceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Public: browse approved resources
    @GetMapping("/api/public/resources")
    public ResponseEntity<Page<Resource>> publicList(
            @RequestParam Long moduleId,
            @RequestParam int year,
            @RequestParam int semester,
            Pageable pageable
    ) {
        return ResponseEntity.ok(resourceService.publicResources(moduleId, year, semester, pageable));
    }

    // Student: upload a resource
    @PostMapping(value = "/api/student/resources", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Resource> upload(
            @Valid @RequestPart("meta") ResourceUploadRequest meta,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "videoMaterialPdf", required = false) MultipartFile videoMaterialPdf
    ) {
        return ResponseEntity.ok(resourceService.upload(
                meta.title(),
                meta.description(),
                meta.moduleId(),
                meta.year(),
                meta.semester(),
                meta.fileType(),
                file,
                thumbnail,
                videoMaterialPdf
        ));
    }

    // Student: view own uploads
    @GetMapping("/api/student/resources/me")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Page<Resource>> myUploads(Pageable pageable) {
        return ResponseEntity.ok(resourceService.myUploads(pageable));
    }

    // Student: update a pending resource
    @PutMapping("/api/student/resources/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Resource> updateMyPending(@PathVariable Long id, @Valid @RequestBody ResourceUpdateRequest req) {
        return ResponseEntity.ok(resourceService.updateMyPending(id, req.title(), req.description()));
    }

    // Student: delete a pending resource
    @DeleteMapping("/api/student/resources/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Void> deleteMyPending(@PathVariable Long id) {
        resourceService.deleteMyPending(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: view pending queue
    @GetMapping("/api/admin/resources/queue")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Page<Resource>> queue(Pageable pageable) {
        return ResponseEntity.ok(resourceService.approvalQueue(pageable));
    }

    // Admin: approve or reject a resource
    @PostMapping("/api/admin/resources/{id}/decision")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Resource> decide(@PathVariable Long id, @Valid @RequestBody ResourceDecisionRequest req) {
        return ResponseEntity.ok(resourceService.decide(id, req.approve(), req.rejectionReason()));
    }

    // Admin: remove any resource
    @DeleteMapping("/api/admin/resources/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> adminRemove(@PathVariable Long id) {
        resourceService.adminRemove(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: view approved resources with optional filters
    @GetMapping("/api/admin/resources/approved")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Page<Resource>> approved(
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            Pageable pageable
    ) {
        return ResponseEntity.ok(resourceService.adminApprovedResources(moduleId, year, semester, pageable));
    }

    // Download/view a resource file
    @GetMapping("/api/resources/download/{id}")
    public ResponseEntity<String> downloadRedirect(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource.getFileUrl());
    }
}
