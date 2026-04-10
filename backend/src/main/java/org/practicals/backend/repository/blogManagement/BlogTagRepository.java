package org.practicals.backend.repository.blogManagement;

import org.practicals.backend.model.blogManagement.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository("blogTagRepository")
public interface BlogTagRepository extends JpaRepository<Tag, Long> {

    // Custom query to find a tag by its string name
    Optional<Tag> findByName(String name);
}
