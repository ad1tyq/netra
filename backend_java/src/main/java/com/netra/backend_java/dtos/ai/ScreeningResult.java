package com.netra.backend_java.dtos.ai;

import lombok.Data;

@Data
public class ScreeningResult {
    private int ai_grade;
    private double referable_probability;
}
