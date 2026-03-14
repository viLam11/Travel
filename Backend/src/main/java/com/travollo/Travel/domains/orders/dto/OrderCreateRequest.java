package com.travollo.Travel.domains.orders.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class OrderCreateRequest {
    List<OrderItem> tickets = new ArrayList<>();
    List<OrderItem> rooms = new ArrayList<>();
    String guestPhone;
    String note;
    List<String> discountIds = new ArrayList<>();;
}
