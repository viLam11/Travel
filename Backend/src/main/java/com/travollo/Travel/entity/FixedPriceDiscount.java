package com.travollo.Travel.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "fixed_price_discounts")
@Data
public class FixedPriceDiscount extends Discount {
    private Double fixedPrice;
}
