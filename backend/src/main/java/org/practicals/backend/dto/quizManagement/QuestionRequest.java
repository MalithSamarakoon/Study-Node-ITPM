package org.practicals.backend.dto.quizManagement;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionRequest {

    @NotBlank
    private String questionText;

    @Min(1)
    private Integer marks;

    @Valid
    @Size(min = 2, max = 6)
    private List<QuestionOptionRequest> options;
}
