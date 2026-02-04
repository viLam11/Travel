package com.travollo.Travel.domains.promotions.dto;

import com.travollo.Travel.utils.CategoryType;
import com.travollo.Travel.utils.DiscountApplyType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DiscountRequest {
    private String name;
    private String code;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long quantity;
    private BigDecimal minSpend;
    private DiscountApplyType applyType;

    // Trường dành riêng cho FixedPriceDiscount
    private Double fixedPrice;

    // Danh sách ID service hoặc Category nếu áp dụng
    private List<Long> serviceIds;
    private CategoryType categoryType;
}

