package com.travollo.Travel.repo;

import com.travollo.Travel.entity.AdministrativeRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministrativeRegionRepo extends JpaRepository<AdministrativeRegion, Long> {
}
