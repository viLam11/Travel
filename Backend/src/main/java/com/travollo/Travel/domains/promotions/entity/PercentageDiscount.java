package com.travollo.Travel.domains.promotions.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "percentage_discounts")
@Data
@SuperBuilder
@EqualsAndHashCode(callSuper=false)
public class PercentageDiscount extends Discount {
    private Double percentage;
    private Double maxDiscountAmount;
}
