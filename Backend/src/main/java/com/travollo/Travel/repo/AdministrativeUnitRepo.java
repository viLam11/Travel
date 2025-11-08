package com.travollo.Travel.repo;

import com.travollo.Travel.entity.AdministrativeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministrativeUnitRepo extends JpaRepository<AdministrativeUnit, Long> {
}
