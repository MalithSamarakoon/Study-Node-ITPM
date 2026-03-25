package com.studynode.backend.teamup.service;

import com.studynode.backend.common.exception.BadRequestException;
import com.studynode.backend.teamup.dto.AuthUserResponse;
import com.studynode.backend.teamup.dto.LoginRequest;
import com.studynode.backend.teamup.dto.RegisterRequest;
import com.studynode.backend.teamup.entity.User;
import com.studynode.backend.teamup.enums.UserRole;
import com.studynode.backend.teamup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AuthUserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(request.password());
        user.setRole(request.role() == null ? UserRole.STUDENT : request.role());

        User saved = userRepository.save(user);
        return toAuthUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUserResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.getPassword().equals(request.password())) {
            throw new BadRequestException("Invalid email or password");
        }

        return toAuthUserResponse(user);
    }

    private AuthUserResponse toAuthUserResponse(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
