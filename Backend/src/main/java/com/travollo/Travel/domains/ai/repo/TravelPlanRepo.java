package com.travollo.Travel.domains.ai.repo;

import com.travollo.Travel.domains.ai.entity.TravelPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TravelPlanRepo extends MongoRepository<TravelPlan, String> {
    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(String userID);
    Optional<TravelPlan> findByIdAndUserId(String planID, String userID);
    long countByUserId(Long userId);
}
