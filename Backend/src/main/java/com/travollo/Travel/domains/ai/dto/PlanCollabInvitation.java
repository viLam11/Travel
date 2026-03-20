package com.travollo.Travel.domains.ai.dto;

import com.travollo.Travel.domains.ai.entity.Permission;
import lombok.Data;

@Data
public class PlanCollabInvitation {
    private String memberId;
    private Permission permission;
}
