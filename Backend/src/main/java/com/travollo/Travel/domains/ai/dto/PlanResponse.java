package com.travollo.Travel.domains.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanResponse {
    private List<ItineraryDay> itinerary;
}