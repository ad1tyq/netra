package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflinePatientDTO {
    private UUID clientUuid;
    private UUID clinicId;
    private UUID createdBy;
    private Map<String, Object> demographics;
    private Double rbsLevel;
    private Boolean isDiabetic;
}
