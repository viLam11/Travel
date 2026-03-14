package com.travollo.Travel.domains.notifications.dto;

import com.travollo.Travel.entity.Order;

public class NotiUpdateRequest {
    private String title;
    private String content;
    private Order referenceOrder = null;
    private boolean isRead = false;
}
