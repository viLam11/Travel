package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepo extends JpaRepository<Discount, Long> {
}
