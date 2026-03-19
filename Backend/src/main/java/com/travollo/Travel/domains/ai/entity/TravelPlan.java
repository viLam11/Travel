package com.travollo.Travel.domains.ai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_travel_plans") // Tên collection trong MongoDB
public class TravelPlan {

    @Id
    private String id;
    // --- THÔNG TIN QUẢN LÝ TỪ HỆ THỐNG ---
    @Field("user_id")
    private String userId;
    @Field("place")
    private String place;
    @Field("status")
    private String status;
    // --- THÔNG TIN TỪ JSON CỦA AI (User có thể sửa) ---
    @Field("trip_title")
    private String tripTitle;
    @Field("overview")
    private String overview;
    @Field("total_estimated_budget")
    private Long totalEstimatedBudget;

    // Tôi thêm trường này để lưu tổng số tiền thực tế user đã tiêu
    @Field("total_actual_budget")
    private Long totalActualBudget;
    @Field("itinerary")
    private List<DailyItinerary> itinerary;
    // --- THỜI GIAN THEO DÕI ---
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt; // Tự động cập nhật mỗi khi user ấn "Lưu/Chỉnh sửa"

    // ==========================================================
    // CÁC CLASS CON BÊN TRONG (NESTED CLASSES)
    // ==========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyItinerary {
        private Integer day;
        private List<Activity> activities;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Activity {
        @Field("time_of_day")
        private String timeOfDay;

        @Field("activity_title")
        private String activityTitle;

        @Field("description")
        private String description;

        @Field("is_system_service")
        private Boolean isSystemService;

        @Field("service_id")
        private Long serviceId; // Sẽ là null nếu không phải service hệ thống

        @Field("estimated_price")
        private Long estimatedPrice;

        @Field("actual_price")
        private Long actualPrice;

        @Field("currency")
        private String currency = "VND"; // Mặc định "VND"
    }
}