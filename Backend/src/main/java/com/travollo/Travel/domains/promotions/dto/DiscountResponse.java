package com.travollo.Travel.domains.promotions.dto;

import com.travollo.Travel.utils.DiscountApplyType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResponse {
    private Long id;
    private String name;
    private String code;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long quantity;
    private BigDecimal minSpend;
    private DiscountApplyType applyType;
    private Double fixedPrice;
}