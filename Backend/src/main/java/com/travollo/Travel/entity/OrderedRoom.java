package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ordered_room")
public class OrderedRoom {
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private BigDecimal amount;
    private BigDecimal price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
