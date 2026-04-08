package com.studynode.backend.teamup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JoinTeamRequest(
        @NotNull(message = "userId is required")
        Long userId,

        @NotBlank(message = "roleInTeam is required")
        @Size(max = 80, message = "roleInTeam must be at most 80 characters")
        String roleInTeam
) {
}
