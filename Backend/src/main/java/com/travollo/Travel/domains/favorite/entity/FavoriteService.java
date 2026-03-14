package com.travollo.Travel.domains.favorite.entity;

import com.travollo.Travel.entity.TService;
import com.travollo.Travel.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
// Unique Constraint: Đảm bảo 1 user không thể thả tim 2 lần cho cùng 1 service
@Table(name = "favorite_services", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_service", columnNames = {"user_id", "service_id"})
}, indexes = {
        @Index(name = "idx_fav_user_id", columnList = "user_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private TService travelService;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
