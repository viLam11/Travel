package com.travollo.Travel.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateOrder {
    List<OrderItem> tickets;
    List<OrderItem> rooms;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    LocalDateTime checkInDate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    LocalDateTime checkOutDate;
    String guestPhone;
    String note;
    List<Long> discountIds;
}
