package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderID;

    private LocalDateTime createdAt;
    private String status; // e.g., "PENDING", "CONFIRMED", "CANCELLED"

    private double totalPrice;
    private double discountPrice;
    private double finalPrice;
    private double deposit;

    private String guestPhone;
    private String note;

    @ManyToMany
    @JoinTable(
            name = "order_discount",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "discount_id")
    )
    private List<Discount> discountList;

    @ManyToOne(fetch =  FetchType.EAGER)
    @JoinColumn(name = "userID")
    private User user;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "serviceID")
    private TService TService;
}
