package com.travollo.Travel.domains.ai.dto;

import com.travollo.Travel.domains.ai.entity.CollaborationStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PlanOverallResponse {
    private String planId;
    private String place;
    private String tripTitle;
    private String overview;
    private String status;

    // Collaboration status
    private CollaborationStatus collaborationStatus = null;

    // Thông tin của Owner
    private UserInfo owner;
    private List<UserInfo> members;

    @Data
    @Builder
    public static class UserInfo {
        private String userId;
        private String username;
        private String avatarUrl;
    }
}
