package com.netra.backend_java.repositories;

import com.netra.backend_java.models.Lesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LesionRepository extends JpaRepository<Lesion, UUID> {
    List<Lesion> findByScreeningId(UUID screeningId);
}
