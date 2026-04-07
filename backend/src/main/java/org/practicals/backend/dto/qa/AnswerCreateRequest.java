package org.practicals.backend.dto.qa;

import jakarta.validation.constraints.NotBlank;

public record AnswerCreateRequest(
        @NotBlank String content
) {
}
