package com.travollo.Travel.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @JsonBackReference
    private Room room;

    private Integer amount;
    private BigDecimal price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
