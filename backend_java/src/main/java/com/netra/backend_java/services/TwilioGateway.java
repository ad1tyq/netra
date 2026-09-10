package com.netra.backend_java.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioGateway {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.number}")
    private String fromWhatsappNumber;

    @Value("${twilio.sms.number}")
    private String fromSmsNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialized successfully");
        } else {
            log.warn("Twilio credentials not found. Notifications will fail if attempted.");
        }
    }

    public String sendWhatsApp(String toPhoneNumber, String patientName, String targetClinic, String passportUrl) {
        try {
            // Using a pre-registered Twilio WhatsApp template format.
            // In production, ensure this exactly matches your registered Meta template.
            String messageBody = String.format("Hello %s, your NETRA-AI eye screening indicates an urgent referral is required. Please visit %s. View your secure Diagnostic Passport here: %s", 
                                               patientName, targetClinic, passportUrl);

            Message message = Message.creator(
                    new PhoneNumber("whatsapp:" + toPhoneNumber),
                    new PhoneNumber("whatsapp:" + fromWhatsappNumber),
                    messageBody)
                .create();

            log.info("WhatsApp sent successfully to {}. SID: {}", toPhoneNumber, message.getSid());
            return message.getSid();
        } catch (Exception e) {
            log.error("Failed to send WhatsApp to {}: {}", toPhoneNumber, e.getMessage());
            throw new RuntimeException("WhatsApp delivery failed", e);
        }
    }

    public String sendSms(String toPhoneNumber, String patientName, String targetClinic, String passportUrl) {
        try {
            String messageBody = String.format("NETRA-AI Alert: %s, please visit %s for an urgent eye checkup. Passport: %s", 
                                               patientName, targetClinic, passportUrl);

            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(fromSmsNumber),
                    messageBody)
                .create();

            log.info("SMS sent successfully to {}. SID: {}", toPhoneNumber, message.getSid());
            return message.getSid();
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", toPhoneNumber, e.getMessage());
            throw new RuntimeException("SMS delivery failed", e);
        }
    }
}
