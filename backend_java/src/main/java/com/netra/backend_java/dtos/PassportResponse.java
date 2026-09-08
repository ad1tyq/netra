package com.netra.backend_java.dtos;

import com.netra.backend_java.models.Screening;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassportResponse {
    
    private UUID screeningId;
    private UUID patientId;
    private String patientName;
    private Integer patientAge;
    
    private ZonedDateTime screeningDate;
    private String sourceClinicName;
    
    private Integer aiGrade;
    private Double referableProbability;
    private Boolean isReferable;
    private Boolean urgentReferral;
    
    private String qrPayload; // Cryptographically signed JWT for offline trust
}
