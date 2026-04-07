package org.practicals.backend.dto.moduleManagement;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ModuleUpsertRequest(
        @NotBlank String name,
        @NotBlank String code,
        String description,
        @Min(3) @Max(4) int year,
        @Min(1) @Max(2) int semester,
        String category
) {
}
