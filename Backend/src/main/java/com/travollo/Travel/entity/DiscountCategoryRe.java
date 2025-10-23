package com.travollo.Travel.entity;

import com.travollo.Travel.utils.CategoryType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "discount_category_re")
public class DiscountCategoryRe {
    @Id
    @ManyToOne
    @JoinColumn(name = "discountID")
    private Discount discount;

    @Id
    @Enumerated(EnumType.STRING)
    private CategoryType categoryType;
}
