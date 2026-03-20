package com.travollo.Travel.domains.ai.repo;

import com.travollo.Travel.domains.ai.entity.CollaborationStatus;
import com.travollo.Travel.domains.ai.entity.PlanCollaboration;
import com.travollo.Travel.domains.ai.entity.TravelPlanSummary;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PlanCollabRepo extends MongoRepository<PlanCollaboration,String> {
    boolean existsByPlanIdAndMemberId(String planId, String memberId);
    Optional<PlanCollaboration> findByIdAndOwnerId(String id, String ownerId);
    Optional<PlanCollaboration> findByIdAndMemberIdAndStatus(String id, String memberId, CollaborationStatus status);
    List<PlanCollaboration> findAllByMemberIdAndStatus(String memberID, CollaborationStatus status);
    List<PlanCollaboration> findAllByPlanId(String planID);
    Optional<PlanCollaboration> findByPlanIdAndMemberId(String planID, String memberID);
    List<TravelPlanSummary> findByIdIn(List<String> ids);
    List<PlanCollaboration> findByPlanIdIn(List<String> planIds);
}
