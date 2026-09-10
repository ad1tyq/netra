package com.netra.backend_java.controllers;

import com.netra.backend_java.dtos.LesionResponse;
import com.netra.backend_java.dtos.ScreeningResponse;
import com.netra.backend_java.services.ScreeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/screenings")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;

    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ScreeningResponse> processScreening(
            @RequestPart("file") MultipartFile file,
            @RequestParam("patientId") UUID patientId,
            @RequestParam("eye") String eye) {

        ScreeningResponse response = screeningService.processScreening(file, patientId, eye);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ScreeningResponse>> getAllScreenings() {
        return ResponseEntity.ok(screeningService.getAllScreenings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreeningResponse> getScreening(@PathVariable UUID id) {
        return ResponseEntity.ok(screeningService.getScreening(id));
    }

    @GetMapping("/{id}/lesions")
    public ResponseEntity<List<LesionResponse>> getLesionsForScreening(@PathVariable UUID id) {
        return ResponseEntity.ok(screeningService.getLesionsForScreening(id));
    }

    @GetMapping(value = "/{id}/image", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getScreeningImage(@PathVariable UUID id) {
        byte[] img = screeningService.getScreeningImage(id);
        if (img == null || img.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(img);
    }
}
