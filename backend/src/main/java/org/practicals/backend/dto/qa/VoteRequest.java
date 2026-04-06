package org.practicals.backend.dto.qa;

import org.practicals.backend.model.qa.VoteType;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(
        @NotNull VoteType voteType
) {
}
