package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.ClinicDistanceResponse;
import com.netra.backend_java.services.RoutingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/routing")
@RequiredArgsConstructor
public class RoutingController {

    private final RoutingService routingService;

    @GetMapping("/nearest-specialist")
    public ResponseEntity<ClinicDistanceResponse> getNearestSpecialist(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {
        
        return ResponseEntity.ok(routingService.getNearestSpecialist(lat, lng));
    }
}
