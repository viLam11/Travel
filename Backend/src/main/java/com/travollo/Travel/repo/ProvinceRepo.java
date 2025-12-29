package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProvinceRepo extends JpaRepository<Province, String> {

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Province p WHERE lower(p.name) LIKE lower(concat('%', ?1, '%')) OR lower(p.name_en) LIKE lower(concat('%', ?1, '%'))")
    java.util.List<Province> findByNameContainingIgnoreCase(String keyword);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Province p WHERE p.administrativeRegion.name = ?1")
    java.util.List<Province> findByMacroRegion(String macroRegion);
}