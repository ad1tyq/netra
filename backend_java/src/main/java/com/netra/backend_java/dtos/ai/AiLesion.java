package com.netra.backend_java.dtos.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiLesion {
    private String type; // "MICROANEURYSM", "HAEMORRHAGE", "EXUDATE"
    private List<Double> bbox; // [x, y, width, height]
    private double confidence;
}
