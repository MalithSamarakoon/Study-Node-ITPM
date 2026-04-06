package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    List<PollOption> findByQuestionIdOrderBySortOrderAsc(Long questionId);

    @Transactional
    void deleteByQuestionId(Long questionId);
}
