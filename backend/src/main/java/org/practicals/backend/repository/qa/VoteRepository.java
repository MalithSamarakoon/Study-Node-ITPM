package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByAnswerIdAndUserId(Long answerId, Long userId);
}
