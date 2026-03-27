package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizOptionResponse {
    private Long id;
    private String optionText;
}
