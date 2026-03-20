package com.travollo.Travel.domains.ai.controller;


import com.travollo.Travel.domains.ai.dto.PlanCollabInvitation;
import com.travollo.Travel.domains.ai.dto.PlanOverallResponse;
import com.travollo.Travel.domains.ai.dto.PlanRequest;
import com.travollo.Travel.domains.ai.dto.PlanResponse;
import com.travollo.Travel.domains.ai.entity.CollaborationStatus;
import com.travollo.Travel.domains.ai.entity.PlanCollaboration;
import com.travollo.Travel.domains.ai.entity.TravelPlan;
import com.travollo.Travel.domains.ai.service.GeminiService;
import com.travollo.Travel.domains.ai.service.PlanAIService;
import com.travollo.Travel.domains.ai.service.PlanCollaborationService;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api/plan-recommend")
@RestController
public class RecommendAIPlan {
    private final PlanAIService planAIService;
    private final GeminiService geminiService;
    private final PlanCollaborationService planCollaborationService;

    @GetMapping("/all")
    public ResponseEntity<List<TravelPlan>> getAllPlan() {
        return ResponseEntity.ok(planAIService.getAll());
    }

    @GetMapping("/{planID}")
    public ResponseEntity<TravelPlan> getPlanById(
            @PathVariable String planID
    ) {
        return ResponseEntity.ok(planAIService.getPlanById(planID));
    }

    @GetMapping("/my-plans")
    public ResponseEntity<List<PlanOverallResponse>> getMyPlans(@CurrentUser User currentUser) {
        return ResponseEntity.ok(planAIService.getMyOwnedPlans(currentUser));
    }

    @GetMapping("/my-shared-plans")
    public ResponseEntity<List<PlanOverallResponse>> getMySharedPlans(@CurrentUser User currentUser) {
        return ResponseEntity.ok(planCollaborationService.getAllPlanCollaboration(currentUser));
    }

    @GetMapping("")
    public ResponseEntity<List<TravelPlan>> getAllPlansOfUser(@CurrentUser User currentUser) {
        return ResponseEntity.ok(planAIService.getAllPlansOfUser(currentUser));
    }

    @PostMapping("/test")
    public String test(
            @RequestParam String question
    ) {
        return geminiService.getAnwser(question, 1, new ArrayList<>());
    }

    @GetMapping("/get-preferences")
    public ResponseEntity<Object> getPreferenceList(
        @RequestParam String place
    ) {
        return ResponseEntity.ok(planAIService.TestTopService(place));
    }

    @PostMapping("/generate")
    public ResponseEntity<TravelPlan> generatePlan(
            @RequestBody PlanRequest planRequest,
            @CurrentUser User currentUser
            ) {
        return ResponseEntity.ok(planAIService.generateRecommendedPlan(planRequest.getPlace(), planRequest.getAdditionalInformation(), planRequest.getNumberOfDays(), currentUser.getUserID()));
    }

    @PatchMapping("/{planID}")
    public ResponseEntity<TravelPlan> updatePlan(
            @PathVariable String planID,
            @ModelAttribute PlanResponse request,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(planAIService.updateUserPlan(planID, currentUser.getUserID(), request));
    }

    @DeleteMapping("/{planID}")
    public ResponseEntity<Object> deletePlan(String planID, @CurrentUser User currentUser) {
        return ResponseEntity.ok(planAIService.deleteTravelPlan(planID, currentUser));
    }

    @PostMapping("/{planID}/share")
    public ResponseEntity<Object> inviteNewMember(
            @PathVariable String planID,
            @RequestBody PlanCollabInvitation invitation,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(planCollaborationService.inviteMember(planID, currentUser.getUserID(), invitation.getMemberId(), invitation.getPermission(), currentUser));
    }

    @DeleteMapping("/{planID}/revoke/{memberId}")
    public ResponseEntity<String> revokeAccess(
            @PathVariable String planID,
            @PathVariable String memberId,
            @CurrentUser User currentUser
    ) {
        planCollaborationService.revokeAccess(planID, memberId, currentUser);
        return ResponseEntity.ok("Revoke successfully");
    }

    @PostMapping("/collab/{collabID}/handle")
    public ResponseEntity<PlanCollaboration> handleInvitation(
            @PathVariable String collabID,
            @RequestBody CollaborationStatus status,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(planCollaborationService.handleInvitation(collabID, currentUser.getUserID(), status));
    }
}
