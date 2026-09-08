package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookStatusUpdateDTO {
    private String providerMessageId;
    private String status; // "SENT", "DELIVERED", "READ", "FAILED"
    private String timestamp;
}
