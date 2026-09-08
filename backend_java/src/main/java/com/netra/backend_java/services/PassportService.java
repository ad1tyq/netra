package com.netra.backend_java.services;

import com.netra.backend_java.dtos.PassportResponse;
import com.netra.backend_java.models.Patient;
import com.netra.backend_java.models.Screening;
import com.netra.backend_java.repositories.ScreeningRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PassportService {

    private final ScreeningRepository screeningRepository;

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public PassportResponse generateDiagnosticPassport(UUID screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new RuntimeException("Screening not found"));

        Patient patient = screening.getPatient();
        String patientName = patient.getDemographics().containsKey("name") ? 
                             patient.getDemographics().get("name").toString() : "Unknown";
        int patientAge = patient.getDemographics().containsKey("age") ? 
                         Integer.parseInt(patient.getDemographics().get("age").toString()) : 0;

        // Determine urgency
        boolean urgentReferral = screening.getAiGrade() != null && screening.getAiGrade() >= 3;

        // Generate offline QR Payload via JWT
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "DIAGNOSTIC_PASSPORT");
        claims.put("screeningId", screening.getId().toString());
        claims.put("patientId", patient.getId().toString());
        claims.put("aiGrade", screening.getAiGrade());
        claims.put("isReferable", screening.getIsReferable());
        claims.put("urgent", urgentReferral);
        claims.put("sourceClinic", patient.getClinic().getName());

        String qrPayload = Jwts.builder()
                .claims(claims)
                .subject(patientName)
                .issuedAt(new Date())
                .signWith(getSigningKey())
                .compact();

        return PassportResponse.builder()
                .screeningId(screening.getId())
                .patientId(patient.getId())
                .patientName(patientName)
                .patientAge(patientAge)
                .screeningDate(screening.getCreatedAt().atZone(ZoneOffset.UTC))
                .sourceClinicName(patient.getClinic() != null ? patient.getClinic().getName() : "Unknown")
                .aiGrade(screening.getAiGrade())
                .referableProbability(screening.getReferableProbability())
                .isReferable(screening.getIsReferable())
                .urgentReferral(urgentReferral)
                .qrPayload(qrPayload)
                .build();
    }
}
