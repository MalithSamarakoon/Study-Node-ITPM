package org.practicals.backend.dto.userManagement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.practicals.backend.model.userManagement.Role;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String studentId;
    private String phoneNumber;
    private Role role;
}
