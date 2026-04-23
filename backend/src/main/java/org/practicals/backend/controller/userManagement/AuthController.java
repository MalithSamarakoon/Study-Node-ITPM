package org.practicals.backend.controller.userManagement;


import java.util.List;
import java.util.stream.Collectors;

import org.practicals.backend.dto.userManagement.JwtResponse;
import org.practicals.backend.dto.userManagement.LoginRequest;
import org.practicals.backend.dto.userManagement.RegistrationRequest;
import org.practicals.backend.security.jwt.JwtUtils;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.practicals.backend.service.userManagement.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:5174"},
        allowedHeaders = "*")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest request) {
        // 1. Create the user in the database
        userService.registerStudent(request);

        // 2. Auto-Login: Authenticate the user immediately after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        // 3. Set the security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 4. Generate the JWT token for the new user
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 5. Prepare the response with user details and token
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Return the same DTO used in the signin method
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getStudentId(),
                roles));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // 1. Authenticate the username and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        // 2. Set the security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate the JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 4. Get user details to return in the response
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getStudentId(),
                roles));
    }
}

