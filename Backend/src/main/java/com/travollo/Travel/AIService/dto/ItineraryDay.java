package com.travollo.Travel.AIService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDay {
    @JsonProperty("day_label")
    private String dayLabel;

    @JsonProperty("morning_activities")
    private List<Activity> morningActivities;

    @JsonProperty("afternoon_activities")
    private List<Activity> afternoonActivities;

    @JsonProperty("evening_activities")
    private List<Activity> eveningActivities;
}