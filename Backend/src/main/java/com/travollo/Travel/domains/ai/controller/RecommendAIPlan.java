package com.travollo.Travel.domains.ai.controller;


import com.travollo.Travel.domains.ai.dto.PlanRequest;
import com.travollo.Travel.domains.ai.dto.PlanResponse;
import com.travollo.Travel.domains.ai.service.GeminiService;
import com.travollo.Travel.domains.ai.service.PlanAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RequiredArgsConstructor
@RequestMapping("/api/plan-recommend")
@RestController
public class RecommendAIPlan {
    private final PlanAIService planAIService;
    private final GeminiService geminiService;
    @PostMapping("/test")
    public String test(
            @RequestParam String question
    ) {
        return geminiService.getAnwser(question, 1, new ArrayList<>());
    };

    @GetMapping("/get-preferences")
    public ResponseEntity<Object> getPreferenceList(
        @RequestParam String place
    ) {
        return ResponseEntity.ok(planAIService.TestTopService(place));
    }

    @PostMapping("/generate")
    public ResponseEntity<PlanResponse> generatePlan(
            @RequestBody PlanRequest planRequest
            ) {
        return ResponseEntity.ok(planAIService.generateRecommendedPlan(planRequest.getPlace(), planRequest.getAdditionalInformation(), planRequest.getNumberOfDays()));
    }
}
