package com.netra.backend_java.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "screenings")
@Data
@NoArgsConstructor
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(length = 3)
    private String eye;

    @Column(name = "ai_grade")
    private Integer aiGrade;

    @Column(name = "referable_probability")
    private Double referableProbability;

    @Column(name = "is_referable", nullable = false)
    private Boolean isReferable;

    @Column(name = "decision_threshold")
    private Double decisionThreshold = 0.40;

    @Column(name = "quality_status", length = 20)
    private String qualityStatus;

    @Column(length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Column(name = "client_uuid", unique = true)
    private UUID clientUuid;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "screening", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lesion> lesions = new ArrayList<>();
}
