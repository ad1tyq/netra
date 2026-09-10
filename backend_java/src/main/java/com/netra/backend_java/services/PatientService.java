package com.netra.backend_java.services;

import com.netra.backend_java.dtos.PatientRegistrationRequest;
import com.netra.backend_java.dtos.PatientResponse;
import com.netra.backend_java.models.Clinic;
import com.netra.backend_java.models.Patient;
import com.netra.backend_java.models.User;
import com.netra.backend_java.repositories.ClinicRepository;
import com.netra.backend_java.repositories.PatientRepository;
import com.netra.backend_java.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;

    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientResponse registerPatient(PatientRegistrationRequest request) {
        
        // Handle offline sync deduplication
        if (request.getClientUuid() != null) {
            patientRepository.findByClientUuid(request.getClientUuid()).ifPresent(patient -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient already exists from offline sync");
            });
        }

        Clinic clinic = clinicRepository.findById(request.getClinicId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Clinic not found"));

        User user = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

        Patient patient = Patient.builder()
                .clinic(clinic)
                .createdBy(user)
                .demographics(request.getDemographics())
                .rbsLevel(request.getRbsLevel())
                .isDiabetic(request.getIsDiabetic())
                .clientUuid(request.getClientUuid())
                .build();

        patient = patientRepository.save(patient);

        return mapToResponse(patient);
    }

    public PatientResponse getPatientById(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        return mapToResponse(patient);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .clinicId(patient.getClinic() != null ? patient.getClinic().getId() : null)
                .clinicName(patient.getClinic() != null ? patient.getClinic().getName() : null)
                .demographics(patient.getDemographics())
                .rbsLevel(patient.getRbsLevel())
                .isDiabetic(patient.getIsDiabetic())
                .createdBy(patient.getCreatedBy() != null ? patient.getCreatedBy().getId() : null)
                .clientUuid(patient.getClientUuid())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
