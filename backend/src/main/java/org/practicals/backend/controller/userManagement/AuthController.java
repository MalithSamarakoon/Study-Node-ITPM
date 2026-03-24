package org.practicals.backend.controller.userManagement;


import org.practicals.backend.dto.userManagement.RegistrationRequest;
import org.practicals.backend.service.userManagement.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegistrationRequest request) {
        userService.registerStudent(request);
        return ResponseEntity.ok("Student registered successfully");
    }
}
