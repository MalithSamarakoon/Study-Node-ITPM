package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentEngagementResponse {
    private final String studentId;
    private final String studentName;
    private final Long attempts;
    private final Double averageScorePercentage;
    private final Double bestScorePercentage;
    private final String lastAttemptDate;
}
