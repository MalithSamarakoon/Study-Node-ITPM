package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizSummaryResponse {
    private Long id;
    private String title;
    private Integer duration;
    private Integer totalMarks;
    private String status;
    private boolean attempted;
    private Long latestAttemptId;
}
