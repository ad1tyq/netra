package com.netra.backend_java.services;

import com.netra.backend_java.models.Clinic;
import com.netra.backend_java.models.Notification;
import com.netra.backend_java.models.Patient;
import com.netra.backend_java.models.Screening;
import com.netra.backend_java.repositories.NotificationRepository;
import com.netra.backend_java.repositories.ScreeningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ScreeningRepository screeningRepository;
    private final WhatsAppMockGateway whatsAppMockGateway;

    // This is called by ScreeningService when a referable screening is saved,
    // or manually via the controller for testing.
    public Notification dispatchReferralNotification(UUID screeningId, String channel) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new RuntimeException("Screening not found"));

        Patient patient = screening.getPatient();
        String patientName = patient.getDemographics().containsKey("name") ? 
                             patient.getDemographics().get("name").toString() : "Patient";
        
        // For the mock demo, we just route them to Jaipur District Hospital or a generic clinic
        String targetClinic = "Jaipur District Tertiary Hospital";

        Map<String, Object> payload = new HashMap<>();
        payload.put("template", "netra_urgent_referral");
        payload.put("patientName", patientName);
        payload.put("targetClinic", targetClinic);

        // 1. Create the QUEUED notification record
        Notification notification = Notification.builder()
                .patient(patient)
                .channel(channel)
                .payload(payload)
                .status("QUEUED")
                .build();
        
        notification = notificationRepository.save(notification);

        // 2. Dispatch via the Mock Gateway
        String providerId = whatsAppMockGateway.sendMockMessage(patientName, "netra_urgent_referral", targetClinic);

        // 3. Update status to SENT
        notification.setProviderMessageId(providerId);
        notification.setStatus("SENT");
        notification.setDispatchedAt(ZonedDateTime.now());

        return notificationRepository.save(notification);
    }

    public Notification handleWebhookUpdate(String providerMessageId, String status) {
        Notification notification = notificationRepository.findByProviderMessageId(providerMessageId)
                .orElseThrow(() -> new RuntimeException("Notification not found for provider ID: " + providerMessageId));
        
        notification.setStatus(status.toUpperCase());
        return notificationRepository.save(notification);
    }

    public Notification getStatus(UUID notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }
}
