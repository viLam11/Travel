package com.travollo.Travel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.joda.time.DateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderID;

    @NotNull(message = "Datetime is required")
    private DateTime orderDate;
    private String status; // e.g., "PENDING", "CONFIRMED", "CANCELLED"
    private double totalPrice;
    private String guestPhone;
    private String note;

    @ManyToOne(fetch =  FetchType.EAGER)
    @JoinColumn(name = "userID")
    private User user;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "serviceID")
    private Service service;
}
