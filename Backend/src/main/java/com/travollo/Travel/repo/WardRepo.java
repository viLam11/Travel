package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WardRepo extends JpaRepository<Ward, String> {
}
