package org.practicals.backend.dto.userManagement;

import lombok.Data;

@Data
public class RegistrationRequest {

    private String username;
    private String studentId;
    private String email;
    private String phoneNumber;
    private String password;
}
