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
public class ContributionRequestDTO {
    private String imagePath;
    private Integer groundTruthGrade;
    private Boolean consentObtained;
    private UUID hospitalId;
    private UUID verifiedBy;
}
