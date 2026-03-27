package org.practicals.backend.dto.quizManagement;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentAnswerRequest {

    @NotNull
    private Long questionId;

    @NotNull
    private Long selectedOptionId;
}
