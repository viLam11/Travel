package com.travollo.Travel.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.travollo.Travel.domains.promotions.entity.Discount;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @UuidGenerator
    @Column(name = "order_id")
    private String orderID;

    private LocalDateTime createdAt;
    private String status; // e.g., "PENDING", "CONFIRMED", "CANCELLED"

    private BigDecimal totalPrice;
    private BigDecimal discountPrice;

    private BigDecimal finalPrice;
    private BigDecimal deposit;

    private String guestPhone;
    private String note;

    @ManyToMany
    @JoinTable(
            name = "order_discount",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "discount_id")
    )
    private List<Discount> discountList;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderedTicket> orderedTickets;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderedRoom> orderedRooms;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userID")
    private User user;
}
