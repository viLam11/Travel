package com.travollo.Travel.domains.travel.dto;

import com.travollo.Travel.domains.orders.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMomoResponse {
    private String requestType;
    private String orderId;
    private String signature;
    private String requestId;
    private Integer errorCode;
    private String payUrl;
    private String message;
    private String localMessage;
    private Order order;
}
