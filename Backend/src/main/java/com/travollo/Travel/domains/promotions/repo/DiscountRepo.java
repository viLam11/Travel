package com.travollo.Travel.domains.promotions.repo;

import com.travollo.Travel.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepo extends JpaRepository<Discount, Long> {
    boolean existsByCode(String code);
}
