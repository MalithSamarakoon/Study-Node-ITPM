package org.practicals.backend.dto.resourceManagement;

import jakarta.validation.constraints.NotBlank;

public record ResourceUpdateRequest(
        @NotBlank String title,
        String description
) {
}
