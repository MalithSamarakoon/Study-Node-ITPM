package com.studynode.backend.teamup.service;

import com.studynode.backend.teamup.dto.AuthUserResponse;
import com.studynode.backend.teamup.dto.LoginRequest;
import com.studynode.backend.teamup.dto.RegisterRequest;

public interface AuthService {
    AuthUserResponse register(RegisterRequest request);

    AuthUserResponse login(LoginRequest request);
}
