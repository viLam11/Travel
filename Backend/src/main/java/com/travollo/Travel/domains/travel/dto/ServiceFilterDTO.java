package com.travollo.Travel.domains.travel.dto;

import com.travollo.Travel.utils.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
@AllArgsConstructor
public class ServiceFilterDTO {
    private String name;
    private ServiceType type;
    private Long minPrice;
    private Long maxPrice;
    private String provinceCode;
    private Long minRating;
    private String tag;

    private boolean onlyWithImages = false;

    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "id";
    private String direction = "ASC";
}
