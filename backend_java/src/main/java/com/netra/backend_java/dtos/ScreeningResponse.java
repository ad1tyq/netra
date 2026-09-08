package com.netra.backend_java.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ScreeningResponse {
    private UUID id;
    private UUID patientId;
    private String eye;
    private Integer aiGrade;
    private Double referableProbability;
    private Boolean isReferable;
    private String qualityStatus;
    private String status;
    private UUID performedBy;
    private LocalDateTime createdAt;
    private List<LesionResponse> lesions;
}
