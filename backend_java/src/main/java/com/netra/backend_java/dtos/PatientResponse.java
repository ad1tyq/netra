package com.netra.backend_java.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class PatientResponse {
    private UUID id;
    private UUID clinicId;
    private String clinicName;
    private Map<String, Object> demographics;
    private Double rbsLevel;
    private Boolean isDiabetic;
    private UUID createdBy;
    private UUID clientUuid;
    private ZonedDateTime createdAt;
}
