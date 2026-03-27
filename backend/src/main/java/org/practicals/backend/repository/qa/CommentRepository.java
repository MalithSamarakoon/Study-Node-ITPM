package org.practicals.backend.repository.qa;

import org.practicals.backend.model.qa.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByAnswerIdOrderByCreatedAtAsc(Long answerId);
}
