package org.practicals.backend.dto.qa;

public record PollOptionResponse(
        Long id,
        String text,
        int voteCount,
        int sortOrder
) {
}
