package org.practicals.backend.repository.quizManagement;

import org.practicals.backend.model.quizManagement.Question;
import org.practicals.backend.model.quizManagement.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuiz(Quiz quiz);
}
