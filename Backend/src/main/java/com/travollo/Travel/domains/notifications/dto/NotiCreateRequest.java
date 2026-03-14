package com.travollo.Travel.domains.notifications.dto;

import com.travollo.Travel.domains.notifications.entity.NotificationType;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotiCreateRequest {
    private NotificationType type;
    private String receiverID;
    private String title;
    private String content;
    private String referenceOrderID = null;
    private LocalDateTime createdAt;
}
