package com.travollo.Travel.domains.chat.dto;

import com.travollo.Travel.domains.chat.entity.MessageType;
import lombok.Data;

@Data
public class ChatMessageDTO {
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType type = MessageType.CHAT;
    private boolean isRead = false;
}
