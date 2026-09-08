package com.netra.backend_java.repositories;

import com.netra.backend_java.models.ContributedRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContributedRecordRepository extends JpaRepository<ContributedRecord, UUID> {
    List<ContributedRecord> findByReviewStatus(String reviewStatus);
}
