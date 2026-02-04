package com.travollo.Travel.domains.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    private String name;
    private String description;
    private String duration;
    @JsonProperty("estimated_cost")
    private String estimatedCost;
    private String location;
}