package com.travollo.Travel.domains.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanResponse {
    private String tripTitle;
    private String overview;
    private Long totalEstimatedBudget;
    private List<ItineraryDay> itinerary;
}