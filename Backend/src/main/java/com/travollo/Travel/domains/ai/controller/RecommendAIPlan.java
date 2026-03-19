package com.travollo.Travel.domains.ai.controller;


import com.travollo.Travel.domains.ai.dto.PlanRequest;
import com.travollo.Travel.domains.ai.dto.PlanResponse;
import com.travollo.Travel.domains.ai.entity.TravelPlan;
import com.travollo.Travel.domains.ai.service.GeminiService;
import com.travollo.Travel.domains.ai.service.PlanAIService;
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

    @GetMapping("/alL")
    public ResponseEntity<List<TravelPlan>> getAllPlan() {
        return ResponseEntity.ok(planAIService.getAll());
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
}
