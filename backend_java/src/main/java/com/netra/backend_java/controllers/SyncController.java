package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.OfflineSyncRequest;
import com.netra.backend_java.dtos.SyncSummaryResponse;
import com.netra.backend_java.services.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @PostMapping("/offline")
    public ResponseEntity<SyncSummaryResponse> processOfflineSync(@RequestBody OfflineSyncRequest request) {
        SyncSummaryResponse summary = syncService.processOfflineSync(request);
        return ResponseEntity.ok(summary);
    }
}
