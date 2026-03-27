package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttemptResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer totalMarks;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private String attemptDate;
}
