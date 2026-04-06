package org.practicals.backend.config;

import org.practicals.backend.model.userManagement.Role;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("Admin@StudyNode2026")); // Your secure password
            admin.setStudentId("ADMIN_001");
            admin.setEmail("admin@studynode.com");
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
        }
    }
}
