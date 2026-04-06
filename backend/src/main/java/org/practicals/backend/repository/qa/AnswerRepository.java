package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionIdOrderByCreatedAtAsc(Long questionId);

    long countByQuestionId(Long questionId);

    boolean existsByQuestionIdAndAcceptedTrue(Long questionId);
}
