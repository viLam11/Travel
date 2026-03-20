package com.travollo.Travel.domains.ai.repo;

import com.travollo.Travel.domains.ai.entity.TravelPlan;
import com.travollo.Travel.domains.ai.entity.TravelPlanSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TravelPlanRepo extends MongoRepository<TravelPlan, String> {
    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(String userID);
    Optional<TravelPlan> findByIdAndUserId(String planID, String userID);
    long countByUserId(Long userId);

    List<TravelPlanSummary> findByIdIn(List<String> planIds);

    @Override
    Page<TravelPlan> findAll(Pageable pageable);

    @Query(value = "{ 'user_id' : ?0 }", sort = "{ 'created_at' : -1 }")
    List<TravelPlan> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
