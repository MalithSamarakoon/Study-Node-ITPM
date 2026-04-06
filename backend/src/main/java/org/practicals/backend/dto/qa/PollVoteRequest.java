package org.practicals.backend.dto.qa;

import jakarta.validation.constraints.NotNull;

public record PollVoteRequest(
        @NotNull Long optionId
) {
}
