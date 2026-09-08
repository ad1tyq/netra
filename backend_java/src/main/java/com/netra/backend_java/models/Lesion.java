package com.netra.backend_java.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lesions")
@Data
@NoArgsConstructor
public class Lesion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @Column(name = "lesion_type", nullable = false, length = 50)
    private String lesionType;

    @Column(name = "box_ymin", nullable = false)
    private Double boxYmin;

    @Column(name = "box_xmin", nullable = false)
    private Double boxXmin;

    @Column(name = "box_ymax", nullable = false)
    private Double boxYmax;

    @Column(name = "box_xmax", nullable = false)
    private Double boxXmax;

    @Column(nullable = false)
    private Double confidence;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
