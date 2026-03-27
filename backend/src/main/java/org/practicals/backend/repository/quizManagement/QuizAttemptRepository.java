package org.practicals.backend.repository.quizManagement;

import org.practicals.backend.model.quizManagement.Quiz;
import org.practicals.backend.model.quizManagement.QuizAttempt;
import org.practicals.backend.model.userManagement.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentOrderByAttemptDateDesc(User student);
    Optional<QuizAttempt> findTopByQuizAndStudentOrderByAttemptDateDesc(Quiz quiz, User student);
}
