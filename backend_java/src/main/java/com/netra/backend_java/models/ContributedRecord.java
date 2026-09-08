package com.netra.backend_java.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "contributed_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContributedRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id")
    private Clinic hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "ground_truth_grade", nullable = false)
    private Integer groundTruthGrade;

    @Column(name = "consent_obtained", nullable = false)
    @Builder.Default
    private Boolean consentObtained = true;

    @Column(name = "review_status", nullable = false, length = 20)
    @Builder.Default
    private String reviewStatus = "PENDING_REVIEW"; // PENDING_REVIEW, APPROVED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
