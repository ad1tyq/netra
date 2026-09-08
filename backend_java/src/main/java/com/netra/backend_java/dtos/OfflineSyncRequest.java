package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflineSyncRequest {
    private List<OfflinePatientDTO> patients;
    private List<OfflineScreeningDTO> screenings;
}
