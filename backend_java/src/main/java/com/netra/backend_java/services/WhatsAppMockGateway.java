package com.netra.backend_java.services;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WhatsAppMockGateway {

    public String sendMockMessage(String patientName, String templateName, String targetClinic) {
        // Simulate network delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Print to console to prove it's working for the demo
        System.out.println("=================================================");
        System.out.println("[WHATSAPP MOCK GATEWAY] Dispatched Message!");
        System.out.println("Template: " + templateName);
        System.out.println("Message: Dear " + patientName + ", your recent Netra AI screening flagged a referable condition. Please visit " + targetClinic + " at your earliest convenience with your diagnostic passport.");
        System.out.println("=================================================");

        // Return a fake Meta provider message ID
        return "wamid." + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
