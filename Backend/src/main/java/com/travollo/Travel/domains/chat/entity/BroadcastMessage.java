package com.travollo.Travel.domains.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "broadcast_messages") // Nên dùng số nhiều cho tên bảng
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BroadcastMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Sender:  "SYSTEM" or Admin
    private String sender;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private String title;
}