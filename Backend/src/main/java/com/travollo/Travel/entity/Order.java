package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;
<<<<<<< HEAD
=======
import org.hibernate.annotations.UuidGenerator;
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
<<<<<<< HEAD
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderID;
=======
    @UuidGenerator
    @Column(name = "order_id")
    private String orderID;
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e

    private LocalDateTime createdAt;
    private String status; // e.g., "PENDING", "CONFIRMED", "CANCELLED"

    private double totalPrice;
    private double discountPrice;
<<<<<<< HEAD
=======

>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
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

<<<<<<< HEAD
    @ManyToOne(fetch =  FetchType.EAGER)
    @JoinColumn(name = "userID")
    private User user;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "serviceID")
    private TService TService;
=======
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderedTicket> orderedTickets;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderedRoom> orderedRooms;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userID")
    private User user;
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
}
