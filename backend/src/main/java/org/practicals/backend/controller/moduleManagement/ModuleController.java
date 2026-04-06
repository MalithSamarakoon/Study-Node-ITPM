package org.practicals.backend.controller.moduleManagement;

import jakarta.validation.Valid;
import org.practicals.backend.dto.moduleManagement.ModuleUpsertRequest;
import org.practicals.backend.model.moduleManagement.Module;
import org.practicals.backend.repository.moduleManagement.ModuleRepository;
import org.practicals.backend.service.moduleManagement.ModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ModuleController {

    private final ModuleService moduleService;
    private final ModuleRepository moduleRepository;

    public ModuleController(ModuleService moduleService, ModuleRepository moduleRepository) {
        this.moduleService = moduleService;
        this.moduleRepository = moduleRepository;
    }

    // Public: browse modules/subjects
    @GetMapping({"/api/public/modules", "/api/public/subjects"})
    public ResponseEntity<List<Module>> publicList(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester
    ) {
        return ResponseEntity.ok(moduleService.listPublic(year, semester));
    }

    // Admin: create module
    @PostMapping({"/api/admin/modules", "/api/subjects"})
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Module> create(@Valid @RequestBody ModuleUpsertRequest req) {
        Module m = Module.builder()
                .name(req.name())
                .code(req.code())
                .description(req.description())
                .year(req.year())
                .semester(req.semester())
                .category(req.category())
                .build();
        return ResponseEntity.ok(moduleService.create(m));
    }

    // Admin: update module
    @PutMapping({"/api/admin/modules/{id}", "/api/subjects/{id}"})
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Module> update(@PathVariable Long id, @Valid @RequestBody ModuleUpsertRequest req) {
        Module m = Module.builder()
                .name(req.name())
                .code(req.code())
                .description(req.description())
                .year(req.year())
                .semester(req.semester())
                .category(req.category())
                .build();
        return ResponseEntity.ok(moduleService.update(id, m));
    }

    // Admin: delete module
    @DeleteMapping({"/api/admin/modules/{id}", "/api/subjects/{id}"})
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: list all modules
    @GetMapping({"/api/admin/modules", "/api/admin/subjects"})
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Module>> adminList() {
        return ResponseEntity.ok(moduleRepository.findAll());
    }
}
