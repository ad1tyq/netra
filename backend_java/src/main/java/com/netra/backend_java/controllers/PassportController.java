package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.PassportResponse;
import com.netra.backend_java.services.PassportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class PassportController {

    private final PassportService passportService;

    @GetMapping("/{id}/passport")
    public ResponseEntity<PassportResponse> getDiagnosticPassport(@PathVariable UUID id) {
        return ResponseEntity.ok(passportService.generateDiagnosticPassport(id));
    }
}
