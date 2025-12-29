package com.travollo.Travel.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "percentage_discounts")
@Data
@EqualsAndHashCode(callSuper=false)
public class PercentageDiscount extends Discount {
    private Double percentage;
    private Double maxDiscountAmount;
}
