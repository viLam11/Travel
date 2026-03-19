package com.travollo.Travel.domains.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travollo.Travel.domains.ai.dto.ItineraryDay;
import com.travollo.Travel.domains.ai.dto.PlanResponse;
import com.travollo.Travel.domains.ai.entity.TravelPlan;
import com.travollo.Travel.domains.ai.repo.TravelPlanRepo;
import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.domains.travel.repo.ServiceRepo;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.entity.Province;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ProvinceRepo;
import jakarta.transaction.Transactional;
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
    private final TravelPlanRepo planRepo;

    private PlanResponse formatPlan(@NotNull String recommendedPlan) {
        try {
            String cleanJsonString = recommendedPlan
                    .replaceAll("\\*", "")
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            if (cleanJsonString.startsWith("[")) {
                cleanJsonString = "{\"itinerary\": " + cleanJsonString + "}";
            } else if (!cleanJsonString.startsWith("{")) {
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

    @Transactional
    public TravelPlan generateRecommendedPlan(String place, String additionalInformation, Integer numberOfDayTrips, String userID) {
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
                
                ### DATA TYPE ENFORCEMENT & NULL HANDLING:
                           - `serviceId`: Must be a exact Number (Long) if `isSystemService` is true. It MUST be strictly `null` (not the string "null" or 0) if `isSystemService` is false.
                           - `isSystemService`: Must be a strict Boolean (`true` or `false`).
                           - `estimatedPrice`: Must be a Number (Long). If the activity is completely free, set it to 0. Do NOT use string formatting (e.g., use 50000, not "50,000").
                           - `actualPrice`: Must always be the Number 0.
                        5. FINANCIAL ACCURACY:
                           - The `totalEstimatedBudget` MUST be the exact mathematical sum of all `estimatedPrice` fields within the entire itinerary.
                ### EXACT JSON SCHEMA:
                {
                  "tripTitle": "String",
                  "overview": "String",
                  "totalEstimatedBudget": Long,
                  "itinerary": [
                    {
                      "day": Integer,
                      "activities": [
                        {
                          "timeOfDay": "String (Exactly one of: MORNING, AFTERNOON, NIGHT)",
                          "activityTitle": "String",
                          "description": "String (Include specific food/restaurant suggestions here if applicable)",
                          "isSystemService": Boolean,
                          "serviceId": Long or null,
                          "estimatedPrice": Long,
                          "actualPrice": 0,
                          "currency": "VND"
                        }
                      ]
                    }
                  ]
                }
                Please generate the itinerary now.
                """.formatted(place, numberOfDayTrips, userNotes, preferenceServices);

        String aiResponse = geminiService.getAnwser(prompt, numberOfDayTrips, new ArrayList<>());
        PlanResponse planResponse = formatPlan(aiResponse);

        List<TravelPlan.DailyItinerary> mappedItinerary = mapItineraryToEntity(planResponse.getItinerary());
        TravelPlan newPlan = TravelPlan.builder()
                .userId(userID)
                .place(place)
                .status("DRAFT")
                .tripTitle(planResponse.getTripTitle())
                .overview(planResponse.getOverview())
                .totalEstimatedBudget(planResponse.getTotalEstimatedBudget())
                .totalActualBudget(0L)
                .itinerary(mappedItinerary)
                .build();
        return planRepo.save(newPlan);
    }

    @Transactional
    public TravelPlan updateUserPlan(String planId, String userId, PlanResponse updatedPlanDto) {
        // 1. Tìm DB
        TravelPlan existingPlan = planRepo.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi!"));

        // 2. Cập nhật Info cơ bản
        existingPlan.setTripTitle(updatedPlanDto.getTripTitle());
        existingPlan.setOverview(updatedPlanDto.getOverview());
        existingPlan.setTotalEstimatedBudget(updatedPlanDto.getTotalEstimatedBudget());

        // 3. Tái sử dụng hàm Map để đè Itinerary mới vào
        List<TravelPlan.DailyItinerary> mappedItinerary = mapItineraryToEntity(updatedPlanDto.getItinerary());
        existingPlan.setItinerary(mappedItinerary);

        // 4. Tái sử dụng hàm tính tổng
        long totalActual = calculateTotalActualBudget(mappedItinerary);
        existingPlan.setTotalActualBudget(totalActual);

        // Logic đổi trạng thái
        if (totalActual > 0 && "DRAFT".equals(existingPlan.getStatus())) {
            existingPlan.setStatus("ONGOING");
        }

        // 5. Save đè
        return planRepo.save(existingPlan);
    }

    @Transactional
    public String deleteTravelPlan(String planID, User user) {
        TravelPlan travelPlan = planRepo.findById(planID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found plan"));
        if (!travelPlan.getUserId().equals(user.getUserID())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "No permission");
        }
        planRepo.deleteById(planID);
        return "Delete successfully";
    }

    public List<TravelPlan> getAll() {
        return planRepo.findAll();
    }

    public List<TravelPlan> getAllPlansOfUser(User user) {
        return planRepo.findByUserIdOrderByCreatedAtDesc(user.getUserID());
    }

    // Hàm 1: Chuyên dùng để Map cái Itinerary từ DTO sang Entity
    private List<TravelPlan.DailyItinerary> mapItineraryToEntity(List<ItineraryDay> dtoItinerary) {
        if (dtoItinerary == null) return new ArrayList<>();

        return dtoItinerary.stream().map(dayDto -> {
            List<TravelPlan.Activity> activities = dayDto.getActivities().stream()
                    .map(actDto -> TravelPlan.Activity.builder()
                            .timeOfDay(actDto.getTimeOfDay())
                            .activityTitle(actDto.getActivityTitle())
                            .description(actDto.getDescription())
                            .isSystemService(actDto.getIsSystemService())
                            .serviceId(actDto.getServiceId())
                            .estimatedPrice(actDto.getEstimatedPrice())
                            // Đảm bảo không bị lỗi NullPointer nếu User chưa nhập
                            .actualPrice(actDto.getActualPrice() != null ? actDto.getActualPrice() : 0L)
                            .currency(actDto.getCurrency())
                            .build())
                    .toList();

            return TravelPlan.DailyItinerary.builder()
                    .day(dayDto.getDay())
                    .activities(activities)
                    .build();
        }).toList();
    }

    // Hàm 2: Chuyên dùng để cộng dồn tiền thực tế
    private long calculateTotalActualBudget(List<TravelPlan.DailyItinerary> itinerary) {
        return itinerary.stream()
                .flatMap(day -> day.getActivities().stream())
                .mapToLong(TravelPlan.Activity::getActualPrice)
                .sum();
    }
}
