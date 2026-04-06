package org.practicals.backend.repository.moduleManagement;

import org.practicals.backend.model.moduleManagement.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByYearAndSemester(int year, int semester);
}
