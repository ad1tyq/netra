package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflineScreeningDTO {
    private UUID clientUuid;
    private UUID patientClientUuid;
    private UUID performedBy;
    
    private String eye;
    private Integer aiGrade;
    private Double referableProbability;
    private Boolean isReferable;
    private Double decisionThreshold;
    private String qualityStatus;
    private String status;
}
