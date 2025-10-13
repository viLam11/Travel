package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Time;

@Data
@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restaurantID;
    private Time openTime;
    private Time closeTime;
    private String workingDays;
    private String cuisineType;
}