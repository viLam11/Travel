package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomID;
    private String type;
    private int quantity;
    private double name;
    private String description;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "serviceID")
    private Service service;
}
