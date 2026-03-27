package org.practicals.backend.dto.quizManagement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ModuleResponse {
    private Long id;
    private String title;
    private String description;
    private String createdBy;
    private Long quizCount;
}
