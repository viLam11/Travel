package com.travollo.Travel.domains.promotions.entity;

import com.travollo.Travel.utils.DiscountApplyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "discounts")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String code;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long quantity;
    private BigDecimal minSpend;

    @Enumerated(EnumType.STRING)
    private DiscountApplyType applyType; // SERVICE, CATEGORY, PROVINCE

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountServiceRe> serviceList;

    @OneToOne(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private DiscountCategoryRe categoryApplyType;

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountProvinceRe> provinceList;
}