package com.travollo.Travel.repo;

import com.travollo.Travel.entity.TService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ServiceRepo extends JpaRepository<TService, Long> {
    @Query(value = "SELECT * FROM services s WHERE s.province_code = ?1 AND s.thumbnail_url IS NOT NULL LIMIT 1", nativeQuery = true)
    TService findFirstByProvinceCodeAndThumbnailUrlNotNull(String provinceCode);

    @Query("SELECT s FROM TService s " +
            "LEFT JOIN s.province p " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:serviceType IS NULL OR s.serviceType = :serviceType) " +
            "AND (:minPrice IS NULL OR s.averagePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR s.averagePrice <= :maxPrice)")
    org.springframework.data.domain.Page<TService> searchServices(
            @org.springframework.data.repository.query.Param("keyword") String keyword,
            @org.springframework.data.repository.query.Param("serviceType") com.travollo.Travel.utils.ServiceType serviceType,
            @org.springframework.data.repository.query.Param("minPrice") Long minPrice,
            @org.springframework.data.repository.query.Param("maxPrice") Long maxPrice,
            org.springframework.data.domain.Pageable pageable
    );
}