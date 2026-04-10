package org.practicals.backend.controller.userManagement;

import jakarta.validation.Valid;
import org.practicals.backend.dto.userManagement.UserResponse;
import org.practicals.backend.dto.userManagement.UserUpdateRequest;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.practicals.backend.service.userManagement.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponse profile = userService.getUserProfileByUsername(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestPart("user") UserUpdateRequest userUpdateRequest,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {

        UserResponse updatedUser = userService.updateUserProfile(userDetails.getId(), userUpdateRequest, profileImage);
        return ResponseEntity.ok(updatedUser);
    }
}

