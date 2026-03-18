package com.travollo.Travel.domains.orders.dto;

import com.travollo.Travel.domains.orders.entity.OrderStatus;
import com.travollo.Travel.domains.orders.entity.OrderedRoom;
import com.travollo.Travel.domains.orders.entity.OrderedTicket;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String orderID;
    private LocalDateTime createdAt;
    private OrderStatus status = OrderStatus.PENDING;
    private BigDecimal totalPrice;
    private BigDecimal discountPrice;
    private BigDecimal finalPrice;
    private BigDecimal deposit;

    private String guestPhone;
    private String note;

    private List<DiscountResponse> discountList;
    private List<OrderedTicket> orderedTickets;
    private List<OrderedRoom> orderedRooms;

    private User user;
}
