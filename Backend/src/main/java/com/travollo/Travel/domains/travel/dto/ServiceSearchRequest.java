package com.travollo.Travel.domains.travel.dto;

import lombok.Data;

@Data
public class ServiceSearchRequest {
    private String provinceCode;
    private String keyword;
    private String serviceType;
    private Long minPrice;
    private Long maxPrice;
    private Long minRating;
    private Long maxRating;

    private String sortBy = "id";
    private String direction = "asc";
    private int page = 0;
    private int size = 10;
}
