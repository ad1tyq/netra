package com.netra.backend_java.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDispatchRequestDTO {
    private UUID screeningId; // The screening that triggered this
    private String channel; // "WHATSAPP" or "SMS"
}
