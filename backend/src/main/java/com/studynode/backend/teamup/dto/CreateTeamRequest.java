package com.studynode.backend.teamup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be at most 120 characters")
        String title,

        @NotBlank(message = "description is required")
        @Size(max = 1500, message = "description must be at most 1500 characters")
        String description,

        @NotBlank(message = "requiredSkills is required")
        String requiredSkills,

        @NotNull(message = "createdByUserId is required")
        Long createdByUserId
) {
}
