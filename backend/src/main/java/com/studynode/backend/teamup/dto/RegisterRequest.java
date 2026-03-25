package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name is required")
        @Size(max = 120, message = "name must be at most 120 characters")
        String name,

        @Email(message = "email must be valid")
        @NotBlank(message = "email is required")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 6, message = "password must be at least 6 characters")
        String password,

        UserRole role
) {
}
