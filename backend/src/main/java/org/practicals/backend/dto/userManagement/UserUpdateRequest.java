package org.practicals.backend.dto.userManagement;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {

    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @Pattern(regexp = "^IT\\d{8}$", message = "Student ID must start with 'IT' followed by 8 digits.")
    private String studentId;

    @Email(message = "Please enter a valid email address.")
    private String email;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number must have exactly 10 digits.")
    private String phone;
}

