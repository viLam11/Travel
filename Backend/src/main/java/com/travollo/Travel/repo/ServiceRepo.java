package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Province;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.utils.ServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRepo extends JpaRepository<TService, Long> {
    @Query(value = "SELECT * FROM services s WHERE s.province_code = ?1 AND s.thumbnail_url IS NOT NULL LIMIT 1", nativeQuery = true)
    TService findFirstByProvinceCodeAndThumbnailUrlNotNull(String provinceCode);

    List<TService> findTop10ByProvince(Province province, Sort sort);

//    @Query("SELECT s FROM TService s " +
//            "LEFT JOIN s.province p " +
//            "WHERE " +
//            "(:keyword IS NULL OR :keyword = '' OR " +
//            "  LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//            "  LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//            "  LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//            "  LOWER(p.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
//            ") " +
//            "AND (:serviceType IS NULL OR s.serviceType = :serviceType) " +
//            "AND (:minPrice IS NULL OR s.averagePrice >= :minPrice) " +
//            "AND (:maxPrice IS NULL OR s.averagePrice <= :maxPrice) " +
//            "AND (:minRating IS NULL OR s.rating >= :minRating)")
//    Page<TService> searchServices(
//            @Param("keyword") String keyword,
//            @Param("serviceType") ServiceType serviceType,
//            @Param("minPrice") Long minPrice,
//            @Param("maxPrice") Long maxPrice,
//            @Param("minRating") Long minRating,
//            Pageable pageable
//    );

    @Query("SELECT s FROM TService s " +
            "LEFT JOIN s.province p " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "  LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "  LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "  LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ") " +
            "AND (:serviceType IS NULL OR s.serviceType = :serviceType) " +
            "AND (:minPrice IS NULL OR s.averagePrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR s.averagePrice <= :maxPrice) " +
            "AND (:minRating IS NULL OR s.rating >= :minRating)")
    Page<TService> searchServices(
            @Param("keyword") String keyword,
            @Param("serviceType") ServiceType serviceType,
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice,
            @Param("minRating") Long minRating,
            Pageable pageable
    );
}
