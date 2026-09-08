package com.netra.backend_java.services;

import com.netra.backend_java.dtos.OfflinePatientDTO;
import com.netra.backend_java.dtos.OfflineScreeningDTO;
import com.netra.backend_java.dtos.OfflineSyncRequest;
import com.netra.backend_java.dtos.SyncSummaryResponse;
import com.netra.backend_java.models.Patient;
import com.netra.backend_java.models.Screening;
import com.netra.backend_java.repositories.ClinicRepository;
import com.netra.backend_java.repositories.PatientRepository;
import com.netra.backend_java.repositories.ScreeningRepository;
import com.netra.backend_java.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final PatientRepository patientRepository;
    private final ScreeningRepository screeningRepository;
    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;

    @Transactional
    public SyncSummaryResponse processOfflineSync(OfflineSyncRequest request) {
        int patientsInserted = 0;
        int patientsSkipped = 0;
        int screeningsInserted = 0;
        int screeningsSkipped = 0;

        // Process Patients
        if (request.getPatients() != null) {
            for (OfflinePatientDTO dto : request.getPatients()) {
                if (patientRepository.findByClientUuid(dto.getClientUuid()).isPresent()) {
                    patientsSkipped++;
                    continue;
                }

                Patient patient = Patient.builder()
                        .clientUuid(dto.getClientUuid())
                        .demographics(dto.getDemographics())
                        .rbsLevel(dto.getRbsLevel())
                        .isDiabetic(dto.getIsDiabetic() != null ? dto.getIsDiabetic() : true)
                        .clinic(dto.getClinicId() != null ? clinicRepository.findById(dto.getClinicId()).orElse(null) : null)
                        .createdBy(dto.getCreatedBy() != null ? userRepository.findById(dto.getCreatedBy()).orElse(null) : null)
                        .build();

                patientRepository.save(patient);
                patientsInserted++;
            }
        }

        // Process Screenings
        if (request.getScreenings() != null) {
            for (OfflineScreeningDTO dto : request.getScreenings()) {
                if (screeningRepository.findByClientUuid(dto.getClientUuid()).isPresent()) {
                    screeningsSkipped++;
                    continue;
                }

                // Need to find the Patient using the client UUID to establish relational link
                Patient patient = patientRepository.findByClientUuid(dto.getPatientClientUuid()).orElse(null);
                if (patient == null) {
                    // Patient not synced yet, cannot attach screening
                    screeningsSkipped++;
                    continue;
                }

                Screening screening = new Screening();
                screening.setClientUuid(dto.getClientUuid());
                screening.setPatient(patient);
                screening.setEye(dto.getEye());
                screening.setAiGrade(dto.getAiGrade());
                screening.setReferableProbability(dto.getReferableProbability());
                screening.setIsReferable(dto.getIsReferable() != null ? dto.getIsReferable() : false);
                screening.setDecisionThreshold(dto.getDecisionThreshold());
                screening.setQualityStatus(dto.getQualityStatus());
                screening.setStatus(dto.getStatus());
                screening.setPerformedBy(dto.getPerformedBy() != null ? userRepository.findById(dto.getPerformedBy()).orElse(null) : null);

                screeningRepository.save(screening);
                screeningsInserted++;
            }
        }

        return SyncSummaryResponse.builder()
                .patientsInserted(patientsInserted)
                .patientsSkipped(patientsSkipped)
                .screeningsInserted(screeningsInserted)
                .screeningsSkipped(screeningsSkipped)
                .build();
    }
}
