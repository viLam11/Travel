package com.travollo.Travel.domains.orders.dto;

import com.travollo.Travel.domains.orders.entity.OrderStatus;
import lombok.Data;

@Data
public class OrderUpdateRequest {
    String guestPhone;
    String note;
    OrderStatus status;
}
