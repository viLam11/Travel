package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "discount_service_re")
public class DiscountServiceRe {
    @Id
    @ManyToOne
    @JoinColumn(name = "discountID")
    private Discount discount;

    @Id
    @ManyToOne
    @JoinColumn(name="serviceID")
    private TService TService;
}
