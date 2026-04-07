package org.practicals.backend.dto.resourceManagement;

import jakarta.validation.constraints.NotNull;

public record ResourceDecisionRequest(
        @NotNull boolean approve,
        String rejectionReason
) {
}
