package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.BulkContributionRequestDTO;
import com.netra.backend_java.dtos.ContributionRequestDTO;
import com.netra.backend_java.dtos.ReviewStatusUpdateRequestDTO;
import com.netra.backend_java.models.ContributedRecord;
import com.netra.backend_java.services.ContributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contributions")
@RequiredArgsConstructor
public class ContributionController {

    private final ContributionService contributionService;

    @PostMapping("/manual")
    public ResponseEntity<ContributedRecord> addManualContribution(@RequestBody ContributionRequestDTO request) {
        ContributedRecord record = contributionService.addManualContribution(request);
        return new ResponseEntity<>(record, HttpStatus.CREATED);
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<List<ContributedRecord>> addBulkContributions(@RequestBody BulkContributionRequestDTO request) {
        List<ContributedRecord> records = contributionService.addBulkContributions(request);
        return new ResponseEntity<>(records, HttpStatus.CREATED);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<ContributedRecord>> getPendingQueue() {
        return ResponseEntity.ok(contributionService.getPendingQueue());
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ContributedRecord> updateReviewStatus(
            @PathVariable UUID id,
            @RequestBody ReviewStatusUpdateRequestDTO request,
            @RequestParam(value = "verifiedBy", required = false) UUID verifiedBy) {
        
        ContributedRecord updated = contributionService.updateReviewStatus(id, request.getReviewStatus(), verifiedBy);
        return ResponseEntity.ok(updated);
    }
}
