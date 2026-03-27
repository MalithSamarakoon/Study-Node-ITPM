package org.practicals.backend.dto.userManagement;

import lombok.Data;

@Data
public class UserProfile {
    private long id;
    private String username;
    private String studentId;
    private String email;
    private String phoneNumber;
}
