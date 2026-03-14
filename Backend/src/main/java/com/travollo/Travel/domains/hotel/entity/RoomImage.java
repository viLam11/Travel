package com.travollo.Travel.domains.hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "hotel_images")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomImage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @OneToMany(mappedBy = "room_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private Room room;
}