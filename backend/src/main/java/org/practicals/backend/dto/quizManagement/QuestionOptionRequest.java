package org.practicals.backend.dto.quizManagement;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionOptionRequest {

    @NotBlank
    private String optionText;

    @JsonProperty("isCorrect")
    @JsonAlias("correct")
    private boolean correct;
}
