package com.netra.backend_java.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LesionResponse {
    private UUID id;
    private String lesionType;
    private Double boxYmin;
    private Double boxXmin;
    private Double boxYmax;
    private Double boxXmax;
    private Double confidence;
}
