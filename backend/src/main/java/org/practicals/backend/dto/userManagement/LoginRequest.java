package org.practicals.backend.dto.userManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Captures login credentials from the React frontend.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
