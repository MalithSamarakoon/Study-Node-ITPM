package org.practicals.backend.dto.quizManagement;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizDetailResponse {
    private Long id;
    private Long moduleId;
    private String title;
    private Integer duration;
    private Integer totalMarks;
    private String status;
    private List<QuizQuestionResponse> questions;
}
