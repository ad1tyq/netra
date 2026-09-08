package com.netra.backend_java.services;

import com.netra.backend_java.dtos.BulkContributionRequestDTO;
import com.netra.backend_java.dtos.ContributionRequestDTO;
import com.netra.backend_java.models.ContributedRecord;
import com.netra.backend_java.repositories.ClinicRepository;
import com.netra.backend_java.repositories.ContributedRecordRepository;
import com.netra.backend_java.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContributionService {

    private final ContributedRecordRepository contributedRecordRepository;
    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;

    public ContributedRecord addManualContribution(ContributionRequestDTO dto) {
        if (dto.getConsentObtained() == null || !dto.getConsentObtained()) {
            throw new IllegalArgumentException("Patient consent is strictly required for data contribution.");
        }

        ContributedRecord record = ContributedRecord.builder()
                .imagePath(dto.getImagePath())
                .groundTruthGrade(dto.getGroundTruthGrade())
                .consentObtained(true)
                .reviewStatus("PENDING_REVIEW")
                .hospital(dto.getHospitalId() != null ? clinicRepository.findById(dto.getHospitalId()).orElse(null) : null)
                .build();

        return contributedRecordRepository.save(record);
    }

    public List<ContributedRecord> addBulkContributions(BulkContributionRequestDTO request) {
        List<ContributedRecord> savedRecords = new ArrayList<>();
        for (ContributionRequestDTO dto : request.getContributions()) {
            try {
                savedRecords.add(addManualContribution(dto));
            } catch (IllegalArgumentException e) {
                // Skip records without consent in bulk uploads
            }
        }
        return savedRecords;
    }

    public List<ContributedRecord> getPendingQueue() {
        return contributedRecordRepository.findByReviewStatus("PENDING_REVIEW");
    }

    public ContributedRecord updateReviewStatus(UUID id, String status, UUID verifiedBy) {
        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        ContributedRecord record = contributedRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setReviewStatus(status);
        if (verifiedBy != null) {
            record.setVerifiedBy(userRepository.findById(verifiedBy).orElse(null));
        }

        return contributedRecordRepository.save(record);
    }
}
