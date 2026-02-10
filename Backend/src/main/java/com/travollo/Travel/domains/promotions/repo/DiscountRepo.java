package com.travollo.Travel.domains.promotions.repo;

import com.travollo.Travel.domains.promotions.entity.Discount;
import com.travollo.Travel.utils.CategoryType;
import com.travollo.Travel.utils.DiscountApplyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountRepo extends JpaRepository<Discount, String> {
    boolean existsByCode(String code);
    List<Discount> findByApplyType(DiscountApplyType applyType);
    List<Discount> findByServiceList_TService_Id(String serviceId);
    List<Discount> findByProvinceList_Province_Code(String code);
    List<Discount> findByCategoryApplyType_CategoryType(CategoryType type);
}
