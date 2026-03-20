package com.travollo.Travel.domains.ai.service;

import com.travollo.Travel.domains.ai.dto.PlanOverallResponse;
import com.travollo.Travel.domains.ai.entity.*;
import com.travollo.Travel.domains.ai.repo.PlanCollabRepo;
import com.travollo.Travel.domains.ai.repo.TravelPlanRepo;
import com.travollo.Travel.domains.notifications.dto.NotiCreateRequest;
import com.travollo.Travel.domains.notifications.entity.NotificationType;
import com.travollo.Travel.domains.notifications.service.NotificationService;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanCollaborationService {
    private final NotificationService notificationService;
    private final PlanCollabRepo planCollabRepo;
    private final UserRepo userRepo;
    private final TravelPlanRepo travelPlanRepo;

    /* Invite members to plan
     * */
    public PlanCollaboration inviteMember(String planId, String ownerId, String memberId, Permission permission, User owner) {
        if (planCollabRepo.existsByPlanIdAndMemberId(planId, memberId)) {
            throw new RuntimeException("This user has been invited.");
        }

        TravelPlan plan = travelPlanRepo.findById(planId).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "NOT FOUND PLAN"));

        if (!ownerId.equals(plan.getUserId())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "NOT OWNER OF THIS PLAN");
        }

        PlanCollaboration newCollab = PlanCollaboration.builder()
                .planId(planId)
                .ownerId(ownerId)
                .memberId(memberId)
                .permission(permission)
                .build();
        PlanCollaboration savedCollab = planCollabRepo.save(newCollab);

        // 3. Gửi thông báo (Góp ý: Có thể dùng Kafka hoặc RabbitMQ nếu hệ thống lớn)  => NOTICE !!
        NotiCreateRequest newNoti = NotiCreateRequest.builder()
                .type(NotificationType.PLAN_INVITATION)
                .title("Plan invitation")
                .content("You're invited to join plan " + planId)
                .referencePlanID(planId)
                .build();
         notificationService.createNotification(owner, newNoti);

        return savedCollab;
    }

    public PlanCollaboration handleInvitation(String collaborationId, String memberId, CollaborationStatus action) {
        if (action == CollaborationStatus.PENDING) {
            throw new IllegalArgumentException("Hành động không hợp lệ.");
        }

        // Tìm đúng lời mời đang chờ xử lý của chính người đó
        System.out.println("Collaboration id " + collaborationId + ", member id: " + memberId);

        PlanCollaboration collaboration = planCollabRepo
                .findByIdAndMemberIdAndStatus(collaborationId, memberId, CollaborationStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời hoặc đã hết hạn."));

        collaboration.setStatus(action);

        return planCollabRepo.save(collaboration);
    }

    // Get all members in plan
    public List<User> getMemberOfPlan(String planID) {
        List<String> memberIds = planCollabRepo.findAllByPlanId(planID).stream()
                .map(PlanCollaboration::getMemberId)
                .toList();

        return userRepo.findAllById(memberIds);
    }

    public void revokeAccess(String planId, String memberId, User owner) {
        // Check owner permission
        PlanCollaboration collaboration = planCollabRepo
                .findByPlanIdAndMemberId(planId, memberId)
                .orElseThrow(() -> new RuntimeException("Not found collaboration"));

        // Revoke access
        planCollabRepo.delete(collaboration);
    }

    // Find all shared plans
    public List<PlanOverallResponse> getAllPlanCollaboration(User currentUser) {
        List<PlanCollaboration> collaborations = planCollabRepo.findAllByMemberIdAndStatus(currentUser.getUserID(), CollaborationStatus.ACCEPTED);

        if (collaborations.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> planIds = collaborations.stream()
                .map(PlanCollaboration::getPlanId)
                .toList();

        Set<String> ownerIds = collaborations.stream()
                .map(PlanCollaboration::getOwnerId)
                .collect(Collectors.toSet());

        List<TravelPlanSummary> planSummaries = travelPlanRepo.findByIdIn(planIds);
        List<User> owners = userRepo.findByUserIDIn(ownerIds);

        // Map userid -> user for O(1) look up.
        Map<String, User> ownerMap = owners.stream()
                .collect(Collectors.toMap(User::getUserID, user -> user));

        // 5. Map plan id -> ownerId
        Map<String, String> planToOwnerMap = collaborations.stream()
                .collect(Collectors.toMap(PlanCollaboration::getPlanId, PlanCollaboration::getOwnerId));

        return planSummaries.stream().map(plan -> {
            String ownerId = planToOwnerMap.get(plan.getId());
            User ownerDetail = ownerMap.get(ownerId);
            List<User> members = getMemberOfPlan(plan.getId());

            return PlanOverallResponse.builder()
                    .planId(plan.getId())
                    .place(plan.getPlace())
                    .tripTitle(plan.getTripTitle())
                    .overview(plan.getOverview())
                    .status(plan.getStatus())
                    .owner(ownerDetail != null ?
                            PlanOverallResponse.UserInfo.builder()
                                    .userId(ownerDetail.getUserID())
                                    .username(ownerDetail.getUsername())
                                    .avatarUrl(ownerDetail.getAvatarUrl())
                                    .build()
                            : null)
                    .members(members != null && !members.isEmpty() ?
                            members.stream()
                                    .map(member -> PlanOverallResponse.UserInfo.builder()
                                            .userId(member.getUserID())
                                            .username(member.getUsername())
                                            .avatarUrl(member.getAvatarUrl())
                                            .build())
                                    .toList()
                            : Collections.emptyList())
                    .build();
        }).toList();
    }
}
