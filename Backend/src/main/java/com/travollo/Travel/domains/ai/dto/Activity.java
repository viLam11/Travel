package com.travollo.Travel.domains.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    private String timeOfDay; // MORNING, AFTERNOON, NIGHT
    private String activityTitle;
    private String description;

    private Boolean isSystemService;
    private Long serviceId;

    private Long estimatedPrice;
    private Long actualPrice;
    private String currency;
}