package com.travollo.Travel.domains.orders.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.travollo.Travel.entity.Ticket;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ordered_ticket")
public class OrderedTicket {
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne
    @JoinColumn(name ="ticket_id")
    @JsonBackReference
    private Ticket ticket;

    private int amount;
    private BigDecimal price;
    private LocalDateTime validStart;
    private LocalDateTime validEnd;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
