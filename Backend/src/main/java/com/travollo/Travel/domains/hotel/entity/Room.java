package com.travollo.Travel.domains.hotel.entity;

import com.travollo.Travel.utils.RoomType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "rooms")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String roomID;

    @Enumerated(EnumType.STRING)
    private RoomType type;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    private int quantity;
    private String name;
    private String description;
    private String roomImgUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RoomImage> images = new ArrayList<>();
}
