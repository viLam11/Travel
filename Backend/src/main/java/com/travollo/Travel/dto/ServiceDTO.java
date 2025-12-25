package com.travollo.Travel.dto;

import lombok.Data;

@Data
public class ServiceDTO {
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
