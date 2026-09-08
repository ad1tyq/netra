package com.netra.backend_java.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class PatientRegistrationRequest {

    @NotNull(message = "Clinic ID is required")
    private UUID clinicId;

    @NotNull(message = "Created By (User ID) is required")
    private UUID createdBy;

    private Map<String, Object> demographics;

    private Double rbsLevel;

    private Boolean isDiabetic = true;

    // Optional UUID from offline client device to prevent duplicates on sync
    private UUID clientUuid;
}
