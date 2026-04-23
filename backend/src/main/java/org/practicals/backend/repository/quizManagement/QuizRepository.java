package org.practicals.backend.repository.quizManagement;

import java.util.List;

import org.practicals.backend.model.quizManagement.Module;
import org.practicals.backend.model.quizManagement.Quiz;
import org.practicals.backend.model.quizManagement.QuizStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByModule(Module module);
    List<Quiz> findByModuleAndStatus(Module module, QuizStatus status);
}
