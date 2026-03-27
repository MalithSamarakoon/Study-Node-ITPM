package org.practicals.backend.repository.userManagement;

import org.practicals.backend.model.userManagement.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByStudentId(String studentId);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByStudentId(String studentId);
}
