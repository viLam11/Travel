package com.travollo.Travel.repo;

import com.travollo.Travel.entity.ImageService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageServiceRepo extends JpaRepository<ImageService, Long> {
}
