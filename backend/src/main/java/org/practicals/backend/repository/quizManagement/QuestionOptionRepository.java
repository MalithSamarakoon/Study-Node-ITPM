package org.practicals.backend.repository.quizManagement;

import java.util.List;

import org.practicals.backend.model.quizManagement.Question;
import org.practicals.backend.model.quizManagement.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestion(Question question);
    void deleteByQuestion(Question question);
}
