package com.travollo.Travel.domains.orders.dto;

import com.travollo.Travel.domains.orders.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String payUrl;
    private OrderResponse order;
}
