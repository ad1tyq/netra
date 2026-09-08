package com.netra.backend_java.repositories;

import com.netra.backend_java.models.Screening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, UUID> {
    Optional<Screening> findByClientUuid(UUID clientUuid);
}
