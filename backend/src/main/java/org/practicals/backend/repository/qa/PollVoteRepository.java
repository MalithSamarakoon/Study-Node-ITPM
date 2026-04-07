package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    Optional<PollVote> findByQuestionIdAndUserId(Long questionId, Long userId);

    long countByQuestionId(Long questionId);

    @Transactional
    void deleteByQuestionId(Long questionId);
}
