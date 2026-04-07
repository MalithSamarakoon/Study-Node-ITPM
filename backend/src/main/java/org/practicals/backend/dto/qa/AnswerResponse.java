package org.practicals.backend.dto.qa;

import java.time.Instant;

public record AnswerResponse(
        Long id,
        Long questionId,
        Long userId,
        String username,
        String content,
        int voteCount,
        boolean accepted,
        Instant createdAt,
        Instant updatedAt
) {
}
