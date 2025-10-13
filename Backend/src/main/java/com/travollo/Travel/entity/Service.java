package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "services")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceID;

    private String serviceName;
    private String description;
    private String region;
    private String city;
    private String address;
    private String serviceType;
    private String thumbnail;
    private double rating;
    private double minPrice;
}
