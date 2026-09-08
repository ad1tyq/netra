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

    @Transactional
    public ScreeningResponse processScreening(MultipartFile file, UUID patientId, String eye) {
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Get currently authenticated user (Technician)
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
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

        return mapToResponse(screening);
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

    private ScreeningResponse mapToResponse(Screening screening) {
        return ScreeningResponse.builder()
                .id(screening.getId())
                .patientId(screening.getPatient().getId())
                .eye(screening.getEye())
                .aiGrade(screening.getAiGrade())
                .referableProbability(screening.getReferableProbability())
                .isReferable(screening.getIsReferable())
                .qualityStatus(screening.getQualityStatus())
                .status(screening.getStatus())
                .performedBy(screening.getPerformedBy().getId())
                .createdAt(screening.getCreatedAt())
                .lesions(screening.getLesions().stream().map(this::mapLesionToResponse).collect(Collectors.toList()))
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
