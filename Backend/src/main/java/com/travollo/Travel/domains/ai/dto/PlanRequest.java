package com.travollo.Travel.domains.ai.dto;

import lombok.Data;

@Data
public class PlanRequest {
    private String place;
    private Integer numberOfDays;
    private String additionalInformation;
}
