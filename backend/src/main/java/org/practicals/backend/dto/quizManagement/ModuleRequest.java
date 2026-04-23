package org.practicals.backend.dto.quizManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String createdBy;
}
