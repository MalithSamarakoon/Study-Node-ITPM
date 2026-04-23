package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ActivityTrendResponse {
    private final String date;
    private final Long attempts;
    private final Long uniqueStudents;
}
