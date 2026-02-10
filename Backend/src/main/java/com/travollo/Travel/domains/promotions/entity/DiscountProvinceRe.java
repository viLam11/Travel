package com.travollo.Travel.domains.promotions.entity;


import com.travollo.Travel.entity.Province;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "discount_province_re")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountProvinceRe {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "discount_id")
    private Discount discount;

    @ManyToOne
    @JoinColumn(name = "province_id")
    private Province province;
}
