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
    // Nhóm áp dụng: ALL, CATERGORY, SERVICE
    private DiscountApplyType applyType;
    // Danh sách ID service hoặc Category nếu áp dụng
    private List<String> serviceList;
    private CategoryType categoryType;
    private List<String> provinceList;

    // Loại: Fixed, Percentage
    private DiscountType discountType;
    // Trường cho FixedPriceDiscount
    private Double fixedPrice;
    // Fields cho Percentage Discount
    private Double percentage;
    private Double maxDiscountAmount;


}

