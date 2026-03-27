package org.practicals.backend.repository.quizManagement;

import java.util.List;

import org.practicals.backend.model.quizManagement.Question;
import org.practicals.backend.model.quizManagement.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuiz(Quiz quiz);
}
