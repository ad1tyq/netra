package com.netra.backend_java.dtos;

import com.netra.backend_java.models.Clinic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicDistanceResponse {
    private Clinic clinic;
    private Double distanceKm;
}
