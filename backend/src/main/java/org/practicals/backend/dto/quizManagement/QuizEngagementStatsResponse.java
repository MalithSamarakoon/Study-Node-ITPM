package org.practicals.backend.dto.quizManagement;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizEngagementStatsResponse {
    private final Long totalAttempts;
    private final Long uniqueStudents;
    private final Long quizzesWithAttempts;
    private final Double averageScorePercentage;
    private final QuizActivityResponse mostEngagedQuiz;
    private final QuizActivityResponse mostLikedQuiz;
    private final List<StudentEngagementResponse> studentEngagement;
    private final List<QuizActivityResponse> quizActivity;
    private final List<ActivityTrendResponse> activityTrend;
}
