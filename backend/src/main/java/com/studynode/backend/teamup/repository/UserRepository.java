package com.studynode.backend.teamup.repository;

import com.studynode.backend.teamup.entity.User;
import com.studynode.backend.teamup.enums.UserRole;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findFirstByRoleOrderByIdAsc(UserRole role);
}
