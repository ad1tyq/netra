package com.netra.backend_java.repositories;

import com.netra.backend_java.models.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, UUID> {
    List<Clinic> findByHasSpecialistTrue();
}
