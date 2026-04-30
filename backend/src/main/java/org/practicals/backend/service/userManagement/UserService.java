package org.practicals.backend.service.userManagement;

import org.practicals.backend.dto.userManagement.RegistrationRequest;
import org.practicals.backend.dto.userManagement.UserResponse;
import org.practicals.backend.dto.userManagement.UserUpdateRequest;
import org.practicals.backend.exception.ResourceNotFoundException;
import org.practicals.backend.model.blogManagement.Blog;
import org.practicals.backend.model.userManagement.Role;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.blogManagement.BlogRepository;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.practicals.backend.security.jwt.JwtUtils;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final JwtUtils jwtUtils;

    @Autowired
    private BlogRepository blogRepository;

    // Constructor injection for dependencies [cite: 8]
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, @Qualifier("userProfileStorageService") FileStorageService fileStorageService, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public UserResponse registerStudent(RegistrationRequest request) {
        // 1. Check if unique identifiers are already taken
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new IllegalArgumentException("Student ID is already registered");
        }

        // 2. Enforce password complexity rules [cite: 19]
        if (!isPasswordValid(request.getPassword())) {
            throw new IllegalArgumentException("Password must be at least 8 characters long, " +
                    "contain an uppercase letter, a lowercase letter, a digit, and a special character.");
        }

        // 3. Create and map the new User entity [cite: 9]
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setStudentId(request.getStudentId());
        user.setPhoneNumber(request.getPhoneNumber());

        // Hash the password using BCrypt before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign the default role for new registrations
        user.setRole(Role.ROLE_STUDENT);

        // 4. Persist to database
        User savedUser = userRepository.save(user);

        // 5. Convert to sanitized UserResponse DTO [cite: 18]
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUserProfile(Long userId, UserUpdateRequest request, MultipartFile profileImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update user fields
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setStudentId(request.getStudentId());
        user.setPhoneNumber(request.getPhone());

        if (profileImage != null && !profileImage.isEmpty()) {
            String filePath = fileStorageService.storeFile(profileImage);
            user.setProfilePicturePath(filePath);
        }

        User updatedUser = userRepository.save(user);

        // --- NEW LOGIC START ---
        // 1. Generate new UserDetails from the updated entity
        UserDetailsImpl userDetails = UserDetailsImpl.build(updatedUser);

        // 2. Create an Authentication object (required by your generateJwtToken method)
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        // 3. Generate a fresh token with the NEW username
        String newToken = jwtUtils.generateJwtToken(authentication);

        // 4. Map to response and attach the token
        UserResponse response = mapToUserResponse(updatedUser);
        response.setToken(newToken);
        return response;
    }

    @Transactional
    public void deleteUser(Long userId) {
        List<Blog> userBlogs = blogRepository.findByWriterId(userId);
        blogRepository.deleteAll(userBlogs);
        userRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToUserResponse(user);
    }

    /**
     * Enforces security rules for passwords[cite: 19].
     * Rules: Min 8 chars, 1 Upper, 1 Lower, 1 Digit, 1 Special Char.
     */
    private boolean isPasswordValid(String password) {
        if (password == null) return false;
        String passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
        return password.matches(passwordPattern);
    }

    /**
     * Maps a User entity to a UserResponse DTO to avoid exposing sensitive data[cite: 18].
     */
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setStudentId(user.getStudentId());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setProfilePicturePath(user.getProfilePicturePath());
        return response;
    }
}
