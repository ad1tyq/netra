package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.NotificationDispatchRequestDTO;
import com.netra.backend_java.dtos.WebhookStatusUpdateDTO;
import com.netra.backend_java.models.Notification;
import com.netra.backend_java.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Manual dispatch (mostly for testing, since ScreeningService triggers it automatically)
    @PostMapping("/notifications/dispatch")
    public ResponseEntity<Notification> dispatchNotification(@RequestBody NotificationDispatchRequestDTO request) {
        Notification notification = notificationService.dispatchReferralNotification(request.getScreeningId(), request.getChannel());
        return ResponseEntity.ok(notification);
    }

    // Polling endpoint to check delivery status
    @GetMapping("/notifications/{id}/status")
    public ResponseEntity<Notification> getNotificationStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.getStatus(id));
    }

    // Simulated Webhook from WhatsApp/Twilio
    @PostMapping("/webhooks/whatsapp-status")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookStatusUpdateDTO request) {
        notificationService.handleWebhookUpdate(request.getProviderMessageId(), request.getStatus());
        return ResponseEntity.ok("ACK");
    }
}
