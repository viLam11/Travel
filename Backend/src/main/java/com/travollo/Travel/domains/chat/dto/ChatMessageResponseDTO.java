package com.travollo.Travel.domains.chat.dto;

import com.travollo.Travel.domains.chat.entity.MessageType;
import com.travollo.Travel.dto.UserDTO;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Data
@Builder
public class ChatMessageResponseDTO {
    private String id;
    private UserChatDTO sender;
    private UserChatDTO receiver;
    private String content;
    private MessageType type;
    private Timestamp createdAt;
    private boolean isRead = false;
}
