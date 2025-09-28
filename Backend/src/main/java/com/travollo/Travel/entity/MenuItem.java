package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "menuitems")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuItemID;

    private String name;
    private String description;
    private double price;
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurantID")
    private Restaurant restaurant;
}
