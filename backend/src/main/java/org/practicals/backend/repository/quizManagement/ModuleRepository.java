package org.practicals.backend.repository.quizManagement;

import org.practicals.backend.model.quizManagement.Module;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, Long> {
}
