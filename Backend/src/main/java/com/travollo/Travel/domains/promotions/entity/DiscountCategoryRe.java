package com.travollo.Travel.domains.promotions.entity;

import com.travollo.Travel.utils.CategoryType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "discount_category_re")
public class DiscountCategoryRe {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "discount_id")
    private Discount discount;

    @Enumerated(EnumType.STRING)
    private CategoryType categoryType;
}
