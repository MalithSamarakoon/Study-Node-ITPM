package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.Question;
import org.practicals.backend.model.qa.QuestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    Page<Question> findByStatus(QuestionStatus status, Pageable pageable);

    boolean existsByUserIdAndTitleIgnoreCase(Long userId, String title);

    boolean existsByUserIdAndTitleIgnoreCaseAndIdNot(Long userId, String title, Long questionId);

    Page<Question> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
