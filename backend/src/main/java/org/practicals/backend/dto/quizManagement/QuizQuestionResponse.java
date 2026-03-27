package org.practicals.backend.dto.quizManagement;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private String questionText;
    private Integer marks;
    private List<QuizOptionResponse> options;
}
