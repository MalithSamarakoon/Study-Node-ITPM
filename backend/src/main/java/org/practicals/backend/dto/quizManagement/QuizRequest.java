package org.practicals.backend.dto.quizManagement;

import java.util.List;

import org.practicals.backend.model.quizManagement.QuizStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizRequest {

    @NotBlank
    private String title;

    @Min(1)
    private Integer duration;

    @Min(1)
    private Integer totalMarks;

    @NotBlank
    private String createdBy;

    @NotNull
    private QuizStatus status;

    @Valid
    @Size(min = 1)
    private List<QuestionRequest> questions;
}
