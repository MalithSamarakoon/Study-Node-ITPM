package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizActivityResponse {
    private final Long quizId;
    private final String quizTitle;
    private final String moduleTitle;
    private final Long attempts;
    private final Long uniqueStudents;
    private final Double averageScorePercentage;
    private final Double repeatAttemptRate;
}
