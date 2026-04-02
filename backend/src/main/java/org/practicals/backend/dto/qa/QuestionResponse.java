package org.practicals.backend.dto.qa;

import org.practicals.backend.model.qa.QuestionStatus;

import java.time.Instant;
import java.util.Set;

public record QuestionResponse(
        Long id,
        Long userId,
        String username,
        String title,
        String description,
        String imageUrl,
        QuestionStatus status,
        Set<String> tags,
        Instant createdAt,
        Instant updatedAt
) {
}
