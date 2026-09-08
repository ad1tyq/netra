package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncSummaryResponse {
    private int patientsInserted;
    private int patientsSkipped;
    private int screeningsInserted;
    private int screeningsSkipped;
}
