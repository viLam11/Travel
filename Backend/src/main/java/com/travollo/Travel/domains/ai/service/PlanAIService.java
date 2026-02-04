package com.travollo.Travel.domains.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travollo.Travel.domains.ai.dto.PlanResponse;
import com.travollo.Travel.entity.Province;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.repo.ServiceRepo;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanAIService {
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final ProvinceRepo provinceRepo;
    private final ServiceRepo serviceRepo;



    private PlanResponse formatPlan(@NotNull String recommendedPlan) {
        try {
            String cleanJsonString = recommendedPlan
                    .replaceAll("\\*", "")
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            if (cleanJsonString.startsWith("[")) {
                cleanJsonString = "{\"itinerary\": " + cleanJsonString + "}";
            }
            else if (!cleanJsonString.startsWith("{")) {
                cleanJsonString = "{" + cleanJsonString + "}";
            }

            // 3. PARSE OBJECT
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            return objectMapper.readValue(cleanJsonString, PlanResponse.class);
        } catch (JsonProcessingException e) {
            System.err.println("Raw AI Response: " + recommendedPlan);
            throw new RuntimeException("Lỗi format JSON từ AI: " + e.getMessage());
        }
    }

    public List<TService> TestTopService(String place) {
        Province visitedProvince = provinceRepo.findByName(place)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found province"));
        List<TService> preferenceServices = serviceRepo.findTop10ByProvince(visitedProvince, Sort.by(Sort.Direction.DESC, "rating"));
        System.out.println(preferenceServices);
        return preferenceServices;
    }

    public PlanResponse generateRecommendedPlan(String place, String additionalInformation, Integer numberOfDayTrips) {
        // 1. Validate & Sanitize Input
        String userNotes = StringUtils.hasText(additionalInformation)
                ? additionalInformation
                : "No specific preferences, focus on must-see landmarks and local culture.";
        Province visitedProvince = provinceRepo.findByName(place)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found province"));
        List<TService> preferenceServices = serviceRepo.findTop10ByProvince(visitedProvince, Sort.by(Sort.Direction.DESC, "rating"));
        System.out.println(preferenceServices);

        // 2. Construct the Professional Prompt
        String prompt = """ 
        ### ROLE
        You are a Strategic Travel Planner for a Booking Platform. Your goal is to design a travel itinerary that prioritizes available travel services while ensuring a logical flow for the user.

        ### INPUT DATA
            - Destination:%s
            - Duration: %d days
            - User Preferences: %s
            - Preference List: %s
    
        ### INSTRUCTIONS
            1.  Prioritization: You MUST prioritize suggesting activities from the provided "Available Tickets/Tours" list. Only suggest outside locations if necessary to fill gaps in the schedule.
            2.  Logistics: Group activities geographically (clustering) to minimize travel time.
            3.  Culinary Guidance: Do NOT recommend specific restaurants or vendors. Instead, strictly mention local specialty dishes (e.g., "Phở Bò", "Bánh Mì") suitable for the time of day and encourage the user to explore local spots nearby.
            4.  Structure: Create a detailed day-by-day plan:
            -   Morning: Activity (Priority from DB) & Breakfast suggestions (Dish name only).
                    -   Afternoon: Activity (Priority from DB) & Lunch suggestions (Dish name only).
                    -   Evening: Nightlife/Relaxation & Dinner suggestions (Dish name only).
            5.  Tone: Professional, persuasive (encouraging booking), and helpful.
    
        ### OUTPUT FORMAT RULES
            1.  LANGUAGE: Strictly VIETNAMESE (Tiếng Việt).
            2.  FORMAT: Use Markdown.
            -   Highlight locations from the "Available Tickets/Tours" list using BOLD AND UPPERCASE to make them stand out.
            -   Use *Italic* for specialty dish names.
            3.  CONTENT:
            -   Trip Title: Catchy and relevant.
                    -   Overview: Brief vibe check.
                    -   Itinerary: Day 1, Day 2... (Clear bullet points).
            -   Highlight: A short list summarizing the key "Must-Book" experiences mentioned in the plan.
    
                    Please generate the itinerary now.
        """.formatted(place, numberOfDayTrips, userNotes, preferenceServices);

                String aiResponse = geminiService.getAnwser(prompt, numberOfDayTrips, new ArrayList<>());
                return formatPlan(aiResponse);
            };
        }
