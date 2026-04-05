package org.practicals.backend.dto.qa;

import org.practicals.backend.model.qa.QuestionStatus;
import org.practicals.backend.model.qa.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record QuestionResponse(
        Long id,
        Long userId,
        String username,
        String title,
        String description,
        String imageUrl,
        QuestionType questionType,
        List<PollOptionResponse> pollOptions,
        Long votedOptionId,
        Long totalVotes,
        Instant pollExpiresAt,
        QuestionStatus status,
        Set<String> tags,
        Instant createdAt,
        Instant updatedAt
) {
}
