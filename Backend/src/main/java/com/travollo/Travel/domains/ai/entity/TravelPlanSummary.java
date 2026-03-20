package com.travollo.Travel.domains.ai.entity;

public interface TravelPlanSummary {
    String getId();
    String getUserId();
    String getPlace();
    String getTripTitle();
    String getOverview();
    Long getTotalEstimatedBudget();
    Long getTotalActualBudget();
    String getStatus();
}