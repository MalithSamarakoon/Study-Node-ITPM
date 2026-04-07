package org.practicals.backend.dto.qa;

import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record QuestionUpdateRequest(
        @NotBlank String title,
        @NotBlank String description,
        Set<String> tags
) {
}
