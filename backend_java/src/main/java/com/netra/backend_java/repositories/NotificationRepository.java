package com.netra.backend_java.repositories;

import com.netra.backend_java.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Optional<Notification> findByProviderMessageId(String providerMessageId);
}
