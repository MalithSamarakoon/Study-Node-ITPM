package org.practicals.backend.repository.resourceManagement;

import org.practicals.backend.model.resourceManagement.Resource;
import org.practicals.backend.model.resourceManagement.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);

    Page<Resource> findByModuleIdAndYearAndSemesterAndStatus(Long moduleId, int year, int semester, ResourceStatus status, Pageable pageable);

    Page<Resource> findByUploadedById(Long uploadedById, Pageable pageable);

    Page<Resource> findByStatusOrderByCreatedAtDesc(ResourceStatus status, Pageable pageable);

    Page<Resource> findByModuleIdAndStatusOrderByCreatedAtDesc(Long moduleId, ResourceStatus status, Pageable pageable);

    Page<Resource> findByModuleIdAndYearAndSemesterAndStatusOrderByCreatedAtDesc(Long moduleId, int year, int semester, ResourceStatus status, Pageable pageable);
}
