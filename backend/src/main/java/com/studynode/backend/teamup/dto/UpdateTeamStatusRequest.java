package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.TeamStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTeamStatusRequest(
        @NotNull(message = "status is required")
        TeamStatus status
) {
}
