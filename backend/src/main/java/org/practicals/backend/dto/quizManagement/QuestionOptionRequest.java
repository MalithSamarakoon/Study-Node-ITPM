package org.practicals.backend.dto.quizManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionOptionRequest {

    @NotBlank
    private String optionText;

    private boolean isCorrect;
}
