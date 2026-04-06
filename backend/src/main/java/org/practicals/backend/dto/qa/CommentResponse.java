package org.practicals.backend.dto.qa;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long answerId,
        Long userId,
        String username,
        String content,
        Instant createdAt
) {
}
