package com.studynode.backend.teamup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTeamRequest(
        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be at most 120 characters")
        String title,

        @NotBlank(message = "description is required")
        @Size(max = 1500, message = "description must be at most 1500 characters")
        String description,

        @NotBlank(message = "requiredSkills is required")
        @Size(max = 500, message = "requiredSkills must be at most 500 characters")
        String requiredSkills
) {
}
