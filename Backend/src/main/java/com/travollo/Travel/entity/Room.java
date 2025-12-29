package com.travollo.Travel.entity;

import com.travollo.Travel.utils.RoomType;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomID;

    @Enumerated(EnumType.STRING)
    private RoomType type;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    private int quantity;
    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
}
