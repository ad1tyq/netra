package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.AuthRequest;
import com.netra.backend_java.dtos.AuthResponse;
import com.netra.backend_java.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request) {
        
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
}
