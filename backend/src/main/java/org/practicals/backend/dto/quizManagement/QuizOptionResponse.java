package org.practicals.backend.dto.quizManagement;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizOptionResponse {
    private Long id;
    private String optionText;
    @JsonProperty("isCorrect")
    private boolean correct;
}
