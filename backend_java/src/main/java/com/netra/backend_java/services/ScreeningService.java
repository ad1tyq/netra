package com.netra.backend_java.services;

import com.netra.backend_java.dtos.LesionResponse;
import com.netra.backend_java.dtos.ScreeningResponse;
import com.netra.backend_java.dtos.ai.AiAnalyzeResponse;
import com.netra.backend_java.dtos.ai.AiLesion;
import com.netra.backend_java.models.Lesion;
import com.netra.backend_java.models.Patient;
import com.netra.backend_java.models.Screening;
import com.netra.backend_java.models.User;
import com.netra.backend_java.repositories.LesionRepository;
import com.netra.backend_java.repositories.PatientRepository;
import com.netra.backend_java.repositories.ScreeningRepository;
import com.netra.backend_java.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreeningService {

    private final AiClientService aiClientService;
    private final ScreeningRepository screeningRepository;
    private final LesionRepository lesionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ScreeningResponse processScreening(MultipartFile file, UUID patientId, String eye) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Get currently authenticated user (Technician)
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        // Call Python AI Worker
        AiAnalyzeResponse aiResponse = aiClientService.analyzeImage(file);

        if ("error".equals(aiResponse.getStatus()) || !aiResponse.getQuality().isGradable()) {
            throw new RuntimeException("Image is ungradable or AI analysis failed: " + aiResponse.getError_message());
        }

        // Build Screening Entity
        Screening screening = new Screening();
        screening.setPatient(patient);
        screening.setEye(eye);
        screening.setAiGrade(aiResponse.getScreening_result().getAi_grade());
        screening.setReferableProbability(aiResponse.getScreening_result().getReferable_probability());

        boolean isReferable = "URGENT_REFERRAL".equals(aiResponse.getRecommendation());
        screening.setIsReferable(isReferable);

        screening.setQualityStatus("GRADABLE");
        screening.setStatus("GRADED");
        screening.setPerformedBy(currentUser);

        screening = screeningRepository.save(screening);

        // Save image to disk for client fundus viewing
        try {
            java.nio.file.Path uploadsDir = java.nio.file.Paths.get("uploads", "screenings");
            if (!java.nio.file.Files.exists(uploadsDir)) {
                java.nio.file.Files.createDirectories(uploadsDir);
            }
            java.nio.file.Path targetFile = uploadsDir.resolve(screening.getId().toString() + ".jpg");
            java.nio.file.Files.write(targetFile, file.getBytes());
        } catch (Exception e) {
            System.err.println("Could not save screening image to disk: " + e.getMessage());
        }

        // Build Lesions
        for (AiLesion aiLesion : aiResponse.getLesions()) {
            Lesion lesion = new Lesion();
            lesion.setScreening(screening);
            lesion.setLesionType(aiLesion.getType());
            lesion.setBoxXmin(aiLesion.getBbox().get(0));
            lesion.setBoxYmin(aiLesion.getBbox().get(1));
            lesion.setBoxXmax(aiLesion.getBbox().get(0) + aiLesion.getBbox().get(2)); // x + w
            lesion.setBoxYmax(aiLesion.getBbox().get(1) + aiLesion.getBbox().get(3)); // y + h
            lesion.setConfidence(aiLesion.getConfidence());
            screening.getLesions().add(lesion);
        }

        lesionRepository.saveAll(screening.getLesions());

        if (isReferable) {
            try {
                notificationService.dispatchReferralNotification(screening.getId(), "WHATSAPP");
            } catch (Exception e) {
                // Log failure but don't break the screening transaction
                System.err.println("Failed to dispatch notification: " + e.getMessage());
            }
        }

        return mapToResponse(screening);
    }

    public byte[] getScreeningImage(UUID id) {
        try {
            java.nio.file.Path targetFile = java.nio.file.Paths.get("uploads", "screenings", id.toString() + ".jpg");
            if (java.nio.file.Files.exists(targetFile)) {
                return java.nio.file.Files.readAllBytes(targetFile);
            }
        } catch (Exception e) {
            System.err.println("Error reading screening image: " + e.getMessage());
        }
        return null;
    }

    public ScreeningResponse getScreening(UUID id) {
        Screening screening = screeningRepository.findById(id).orElseThrow();
        return mapToResponse(screening);
    }

    public List<LesionResponse> getLesionsForScreening(UUID screeningId) {
        return lesionRepository.findByScreeningId(screeningId).stream()
                .map(this::mapLesionToResponse)
                .collect(Collectors.toList());
    }

    public List<ScreeningResponse> getAllScreenings() {
        return screeningRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ScreeningResponse mapToResponse(Screening screening) {
        String patientName = null;
        Integer patientAge = null;
        String patientGender = null;
        String patientPhone = null;
        String clinicName = null;

        if (screening.getPatient() != null) {
            java.util.Map<String, Object> demo = screening.getPatient().getDemographics();
            if (demo != null) {
                patientName = demo.get("name") != null ? demo.get("name").toString() : null;
                if (demo.get("age") != null) {
                    try {
                        patientAge = Integer.parseInt(demo.get("age").toString());
                    } catch (Exception ignored) {
                    }
                }
                patientGender = demo.get("gender") != null ? demo.get("gender").toString() : null;
                patientPhone = demo.get("phone") != null ? demo.get("phone").toString() : null;
            }
            if (screening.getPatient().getClinic() != null) {
                clinicName = screening.getPatient().getClinic().getName();
            }
        }

        return ScreeningResponse.builder()
                .id(screening.getId())
                .patientId(screening.getPatient() != null ? screening.getPatient().getId() : null)
                .eye(screening.getEye())
                .aiGrade(screening.getAiGrade())
                .referableProbability(screening.getReferableProbability())
                .isReferable(screening.getIsReferable())
                .qualityStatus(screening.getQualityStatus())
                .status(screening.getStatus())
                .performedBy(screening.getPerformedBy() != null ? screening.getPerformedBy().getId() : null)
                .createdAt(screening.getCreatedAt())
                .lesions(screening.getLesions() != null
                        ? screening.getLesions().stream().map(this::mapLesionToResponse).collect(Collectors.toList())
                        : java.util.Collections.emptyList())
                .patientName(patientName)
                .patientAge(patientAge)
                .patientGender(patientGender)
                .patientPhone(patientPhone)
                .clinicName(clinicName)
                .build();
    }

    private LesionResponse mapLesionToResponse(Lesion lesion) {
        return LesionResponse.builder()
                .id(lesion.getId())
                .lesionType(lesion.getLesionType())
                .boxYmin(lesion.getBoxYmin())
                .boxXmin(lesion.getBoxXmin())
                .boxYmax(lesion.getBoxYmax())
                .boxXmax(lesion.getBoxXmax())
                .confidence(lesion.getConfidence())
                .build();
    }
}
