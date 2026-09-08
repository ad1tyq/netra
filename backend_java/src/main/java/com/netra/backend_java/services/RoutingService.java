package com.netra.backend_java.services;

import com.netra.backend_java.dtos.ClinicDistanceResponse;
import com.netra.backend_java.models.Clinic;
import com.netra.backend_java.repositories.ClinicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoutingService {

    private final ClinicRepository clinicRepository;
    private static final int EARTH_RADIUS_KM = 6371;

    public ClinicDistanceResponse getNearestSpecialist(Double lat, Double lng) {
        List<Clinic> specialistClinics = clinicRepository.findByHasSpecialistTrue();

        if (specialistClinics.isEmpty()) {
            throw new RuntimeException("No specialist clinics found in the system.");
        }

        Clinic nearestClinic = null;
        double minDistance = Double.MAX_VALUE;

        for (Clinic clinic : specialistClinics) {
            double distance = calculateHaversineDistance(lat, lng, clinic.getLatitude(), clinic.getLongitude());
            if (distance < minDistance) {
                minDistance = distance;
                nearestClinic = clinic;
            }
        }

        return ClinicDistanceResponse.builder()
                .clinic(nearestClinic)
                .distanceKm(Math.round(minDistance * 100.0) / 100.0) // Round to 2 decimal places
                .build();
    }

    private double calculateHaversineDistance(double startLat, double startLong, double endLat, double endLong) {
        double dLat = Math.toRadians((endLat - startLat));
        double dLong = Math.toRadians((endLong - startLong));

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = haversine(dLat) + Math.cos(startLat) * Math.cos(endLat) * haversine(dLong);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    private double haversine(double val) {
        return Math.pow(Math.sin(val / 2), 2);
    }
}
