package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.TeamStatus;
import java.time.LocalDateTime;

public record TeamResponse(
        Long id,
        String title,
        String description,
        String requiredSkills,
        TeamStatus status,
        Long createdByUserId,
        LocalDateTime createdAt
) {
}
