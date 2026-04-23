package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttemptQuestionReviewResponse {
    private Long questionId;
    private String questionText;
    private Integer marks;
    private String selectedOptionText;
    private String correctOptionText;
    private boolean correct;
}