package com.travollo.Travel.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "percentage_discounts")
@Data
public class PercentageDiscount extends Discount {
    private Double percentage;
    private Double maxDiscountAmount;
}
