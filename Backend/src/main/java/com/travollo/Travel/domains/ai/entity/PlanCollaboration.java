package com.travollo.Travel.domains.ai.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "plan_collaborations")
@CompoundIndex(name = "plan_member_idx", def = "{'planId': 1, 'memberId': 1}", unique = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlanCollaboration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String planId;
    private String ownerId;
    private String memberId;

    private Permission permission;
    @Builder.Default
    private CollaborationStatus status = CollaborationStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
