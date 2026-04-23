package org.practicals.backend.repository.quizManagement;

import java.util.List;

import org.practicals.backend.model.quizManagement.QuizAttempt;
import org.practicals.backend.model.quizManagement.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findByAttempt(QuizAttempt attempt);
    List<StudentAnswer> findByQuestion(org.practicals.backend.model.quizManagement.Question question);
}
