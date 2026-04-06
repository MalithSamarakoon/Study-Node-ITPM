package org.practicals.backend.dto.resourceManagement;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.practicals.backend.model.resourceManagement.ResourceType;

public record ResourceUploadRequest(
        @NotBlank String title,
        String description,
        @NotNull Long moduleId,
        @Min(3) @Max(4) int year,
        @Min(1) @Max(2) int semester,
        @NotNull ResourceType fileType
) {
}
