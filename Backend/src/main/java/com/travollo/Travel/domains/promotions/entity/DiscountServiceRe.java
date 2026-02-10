package com.travollo.Travel.domains.promotions.entity;

import com.travollo.Travel.entity.TService;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "discount_service_re")
public class DiscountServiceRe {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "discount_id")
    private Discount discount;

    @ManyToOne
    @JoinColumn(name="service_id")
    private TService TService;
}
