package com.travollo.Travel.entity;

import com.travollo.Travel.utils.CategoryType;
import com.travollo.Travel.utils.DiscountApplyType;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "discounts")
@Inheritance(strategy = InheritanceType.JOINED)
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long quantity;
    private BigDecimal minSpend;

    @Enumerated(EnumType.STRING)
    private DiscountApplyType applyType; // SERVICE, CATEGORY

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountServiceRe> serviceList;

    @OneToOne(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private DiscountCategoryRe categoryApplyType;
}