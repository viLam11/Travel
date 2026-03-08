package com.travollo.Travel.domains.chat.service;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.chat.dto.ChatMessageDTO;
import com.travollo.Travel.domains.chat.dto.ChatMessageResponseDTO;
import com.travollo.Travel.domains.chat.dto.UserChatDTO;
import com.travollo.Travel.domains.chat.entity.ChatMessage;
import com.travollo.Travel.domains.chat.repo.ChatRepo;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepo chatMessageRepository;
    private final UserRepo userRepository;

    /**
     * Save a new chat message to the database
     * @param dto The data transfer object containing message details (senderId, receiverId, content)
     * @return The saved ChatMessage entity
     * */
    @Transactional
    public ChatMessage saveMessage(ChatMessageDTO dto) {
        // Tạo proxy user rỗng chỉ chứa ID (Cực kỳ tối ưu, không tốn câu query SELECT nào)
        User senderRef = userRepository.getReferenceById(dto.getSenderId());
        User receiverRef = userRepository.getReferenceById(dto.getReceiverId());
        // Build entity
        ChatMessage message = ChatMessage.builder()
                .sender(senderRef)
                .receiver(receiverRef)
                .content(dto.getContent())
                .isRead(false)
                .build();
        // Lưu vào DB
        return chatMessageRepository.save(message);
    }

    /**
     * Mark all messages from sender to current user as read
     * @param senderId The ID of the sender whose messages should be marked as read
     * @param currentUserId The ID of the currently authenticated user (receiver)
     * */
    @Transactional
    public void markMessagesAsRead(String senderId, String currentUserId) {
        chatMessageRepository.markMessagesAsRead(senderId, currentUserId);
    }

    /**
     * Retrieve chat history between current user and a specific receiver
     * @param currentUserId The ID of the currently authenticated user
     * @param receiverId The ID of the other user in the conversation
     * @return List of ChatMessageResponseDTO representing the chat history
     * */
    public PageResponse<ChatMessageResponseDTO> getChatHistory(String currentUserId, String receiverId, int pageNo, int pageSize) {
        Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNo);
        Page<ChatMessage> messagePage = chatMessageRepository.findChatHistory(currentUserId, receiverId, pageable);

        List<ChatMessageResponseDTO> content = messagePage.getContent().stream()
                .map(this::mapToChatMessageResponseDTO)
                .toList();

        return new PageResponse<>(
                content,
                messagePage.getNumber(),
                messagePage.getSize(),
                messagePage.getTotalElements(),
                messagePage.getTotalPages(),
                messagePage.isLast()
        );
    }

    /**
     * Get list of last messages for each conversation of the current user
     * @param currentUser The currently authenticated user
     * @return List of ChatMessageResponseDTO representing the last message in each conversation
     * */
    public List<ChatMessageResponseDTO> getChatList(User currentUser) {
        List<ChatMessage> lastMessages = chatMessageRepository.findLastMessagesForUser(currentUser.getUserID());
        return lastMessages.stream()
                .map(this::mapToChatMessageResponseDTO)
                .toList();
    }

    /**
     * Map CHAT_MESSAGE ENTITY -> CHAT_MESSAGE_RESPONSE_DTO
     * */
    public ChatMessageResponseDTO mapToChatMessageResponseDTO(ChatMessage message) {
        // 1.1 Map User Entity -> UserDTO
        UserChatDTO senderDTO = UserChatDTO.builder()
                .userId(message.getSender().getUserID())
                 .username(message.getSender().getUsername())
                 .avatarUrl(message.getSender().getAvatarUrl())
                .build();
        // 1.2 Map User Entity -> UserDTO
        UserChatDTO receiverDTO = UserChatDTO.builder()
                .userId(message.getReceiver().getUserID())
                .username(message.getReceiver().getUsername())
                .avatarUrl(message.getReceiver().getAvatarUrl())
                .build();
        // 2. Map ChatMessage -> ChatMessageResponseDTO
        return ChatMessageResponseDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .type(message.getType())
                .createdAt(message.getCreatedAt())
                .isRead(message.isRead())
                .sender(senderDTO)
                .receiver(receiverDTO)
                .build();
    }

        /**
         * Update the content of a chat message
         * */
        public ChatMessageResponseDTO updateMessageContent(String messageId, String newContent, User currentUser) {
            ChatMessage message = chatMessageRepository.findById(messageId)
                    .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Message not found"));
            if (!message.getSender().getUserID().equals(currentUser.getUserID())) {
                throw new CustomException(HttpStatus.FORBIDDEN, "You can only update your own messages");
            }
            message.setContent(newContent);
            ChatMessage updatedMessage = chatMessageRepository.save(message);
            return mapToChatMessageResponseDTO(updatedMessage);
        }

    /**
     * Delete a chat message
     * */
    public void deleteMessage(String messageId, User currentUser) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getSender().getUserID().equals(currentUser.getUserID())) {
            throw new RuntimeException("You can only delete your own messages");
        }
        chatMessageRepository.delete(message);
    }
}