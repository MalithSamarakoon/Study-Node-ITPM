package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.UserRole;

public record AuthUserResponse(
        Long id,
        String name,
        String email,
        UserRole role
) {
}
