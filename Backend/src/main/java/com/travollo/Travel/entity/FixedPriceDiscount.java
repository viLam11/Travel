package com.travollo.Travel.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "fixed_price_discounts")
@Data
@EqualsAndHashCode(callSuper=false)
public class FixedPriceDiscount extends Discount {
    private Double fixedPrice;
}
