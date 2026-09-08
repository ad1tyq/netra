package com.netra.backend_java.services;

import com.netra.backend_java.dtos.ai.AiAnalyzeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiClientService {

    private final RestTemplate restTemplate;

    @Value("${ai.worker.url}")
    private String aiWorkerUrl;

    public AiClientService() {
        this.restTemplate = new RestTemplate();
    }

    public AiAnalyzeResponse analyzeImage(MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String url = aiWorkerUrl + "/internal/ai/analyze";
        
        ResponseEntity<AiAnalyzeResponse> response = restTemplate.postForEntity(
                url,
                requestEntity,
                AiAnalyzeResponse.class
        );

        return response.getBody();
    }
}
