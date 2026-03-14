package com.travollo.Travel.domains.promotions.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResponse {
    private String id;
    private String name;
    private String code;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long quantity;
    private BigDecimal minSpend;
    private Boolean isSystem;

    // discount type: Fixed, Percentage
    private DiscountType discountType;
    // fixed price
    private Double fixedPrice;
    // percentage
    private Double percentage;
    private Double maxDiscountAmount;
}