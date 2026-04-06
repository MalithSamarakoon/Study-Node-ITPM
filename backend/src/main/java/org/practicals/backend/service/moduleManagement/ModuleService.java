package org.practicals.backend.service.moduleManagement;

import org.practicals.backend.model.moduleManagement.Module;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.moduleManagement.ModuleRepository;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;

    public ModuleService(ModuleRepository moduleRepository, UserRepository userRepository) {
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
    }

    public List<Module> listPublic(Integer year, Integer semester) {
        if (year != null && semester != null) {
            return moduleRepository.findByYearAndSemester(year, semester);
        }
        return moduleRepository.findAll();
    }

    public Module create(Module module) {
        Long userId = getCurrentUserId();
        User creator = userRepository.findById(userId).orElseThrow();
        module.setCreatedBy(creator);
        return moduleRepository.save(module);
    }

    public Module update(Long id, Module updated) {
        Module m = moduleRepository.findById(id).orElseThrow();
        m.setName(updated.getName());
        m.setCode(updated.getCode());
        m.setDescription(updated.getDescription());
        m.setYear(updated.getYear());
        m.setSemester(updated.getSemester());
        m.setCategory(updated.getCategory());
        return moduleRepository.save(m);
    }

    public void delete(Long id) {
        moduleRepository.deleteById(id);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }
}
