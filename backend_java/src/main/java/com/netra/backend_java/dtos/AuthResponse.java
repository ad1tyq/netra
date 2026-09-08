package com.netra.backend_java.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UUID userId;
    private String fullName;
    private String role;
    private UUID clinicId;
}
