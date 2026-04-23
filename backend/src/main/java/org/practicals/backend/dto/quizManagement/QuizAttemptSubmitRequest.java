package org.practicals.backend.dto.quizManagement;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizAttemptSubmitRequest {

    @NotBlank
    private String studentId;

    @Valid
    @NotEmpty
    private List<StudentAnswerRequest> answers;
}
