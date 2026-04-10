package org.practicals.backend.repository.blogManagement;


import org.practicals.backend.model.blogManagement.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    // Standard CRUD methods are inherited automatically
}
