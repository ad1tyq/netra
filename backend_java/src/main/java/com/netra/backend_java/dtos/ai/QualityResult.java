package com.netra.backend_java.dtos.ai;

import lombok.Data;

@Data
public class QualityResult {
    private boolean gradable;
    private double blur_score;
    private String exposure;
}
