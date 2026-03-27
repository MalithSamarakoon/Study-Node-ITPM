package org.practicals.backend.dto.quizManagement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuizAttemptSubmitRequest {

    @NotBlank
    private String studentId;

    @Valid
    @NotEmpty
    private List<StudentAnswerRequest> answers;
}
