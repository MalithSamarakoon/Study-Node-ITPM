package org.practicals.backend.dto.userManagement;

import java.util.List;

import lombok.Data;

/**
 * Returns the JWT and user details back to the student.
 */
@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String studentId;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String email, String studentId, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.studentId = studentId;
        this.roles = roles;
    }
}
