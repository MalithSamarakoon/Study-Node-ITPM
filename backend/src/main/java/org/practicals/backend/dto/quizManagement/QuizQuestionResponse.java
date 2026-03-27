package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private String questionText;
    private Integer marks;
    private List<QuizOptionResponse> options;
}
