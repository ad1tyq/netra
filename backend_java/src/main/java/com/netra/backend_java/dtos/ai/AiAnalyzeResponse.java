package com.netra.backend_java.dtos.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiAnalyzeResponse {
    private String status;
    private QualityResult quality;
    private ScreeningResult screening_result;
    private String recommendation; // "ROUTINE_ANNUAL_CHECK" or "URGENT_REFERRAL"
    private List<AiLesion> lesions;
    private String error_message;
}
