package com.travollo.Travel.domains.chat.entity;

import com.travollo.Travel.domains.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "chat_messages")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // 1 user can send many messages, but 1 message is belong to only 1 sender -> ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // 1 user can receive many messages, but 1 message is belong to only 1 receiver -> ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT") // for long content
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @CreationTimestamp // default create timestamp, auto set when insert, and never update
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // State of the message, whether it has been read by the receiver or not
    @Builder.Default
    private boolean isRead = false;
}