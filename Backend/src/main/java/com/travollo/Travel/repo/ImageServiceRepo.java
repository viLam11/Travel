package com.travollo.Travel.repo;

import com.travollo.Travel.entity.ImageService;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageServiceRepo extends JpaRepository<ImageService, Long> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comments WHERE service_id := ?1", nativeQuery = true)
    int deleteAllImgByServiceID(Long serviceID);
}
