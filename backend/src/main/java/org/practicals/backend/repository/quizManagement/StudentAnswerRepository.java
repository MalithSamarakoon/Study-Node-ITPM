package org.practicals.backend.repository.quizManagement;

import org.practicals.backend.model.quizManagement.QuizAttempt;
import org.practicals.backend.model.quizManagement.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttempt(QuizAttempt attempt);
}
