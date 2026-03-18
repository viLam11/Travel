package com.travollo.Travel.domains.orders.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.travollo.Travel.domains.orders.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentMomoResponse {
    private String requestType;
    private String orderId;
    private String signature;
    private String requestId;
    private Integer errorCode;
    private String payUrl;
    private String message;
    private String localMessage;
    private String qrCodeUrl;
}
