package com.travollo.Travel.AIService.controller;


import com.travollo.Travel.AIService.dto.PlanRequest;
import com.travollo.Travel.AIService.service.GeminiService;
import com.travollo.Travel.AIService.service.PlanAIService;
import com.travollo.Travel.dto.Response;
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

    @PostMapping("/generate")
    public ResponseEntity<Object> generatePlan(
            @RequestBody PlanRequest planRequest
            ) {
        return ResponseEntity.ok(planAIService.generateRecommendedPlan(planRequest.getPlace(), planRequest.getAdditionalInformation(), planRequest.getNumberOfDays()));
    }
}
