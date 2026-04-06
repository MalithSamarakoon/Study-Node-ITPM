package org.practicals.backend.dto.qa;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PollCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(min = 2, max = 4) List<@NotBlank @Size(max = 120) String> options,
        @Min(1) @Max(30) Integer expiresInDays
) {
}
