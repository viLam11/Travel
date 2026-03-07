package com.travollo.Travel.domains.chat.service;

import com.travollo.Travel.domains.chat.dto.ChatMessageDTO;
import com.travollo.Travel.domains.chat.dto.ChatMessageResponseDTO;
import com.travollo.Travel.domains.chat.dto.UserChatDTO;
import com.travollo.Travel.domains.chat.entity.ChatMessage;
import com.travollo.Travel.domains.chat.repo.ChatRepo;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepo chatMessageRepository;
    private final UserRepo userRepository;

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
                // .isRead(false) // Mặc định trong builder đã có
                .build();

        // Lưu vào DB
        return chatMessageRepository.save(message);
    }

    @Transactional
    public void markMessagesAsRead(String senderId, String currentUserId) {
        chatMessageRepository.markMessagesAsRead(senderId, currentUserId);
    }

    public List<ChatMessageResponseDTO> getChatHistory(String currentUserEmail, String receiverId) {
        System.out.println("Tìm lịch sử chat giữa: " + currentUserEmail + " và " + receiverId);
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + currentUserEmail));
        String currentUserId = currentUser.getUserID();
        List<ChatMessage> messages = chatMessageRepository.findChatHistory(currentUserId, receiverId);
        System.out.println("Số tin nhắn tìm được: " + messages);

        // Map từ Entity sang DTO để trả về Frontend
        return messages.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public ChatMessageResponseDTO mapToResponseDTO(ChatMessage message) {

        // 1.1 Map User Entity -> UserDTO
        UserChatDTO senderDTO = UserChatDTO.builder()
                .userId(message.getSender().getUserID())
                // Giả sử Entity User của bạn có hàm getUsername() và getAvatar()
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

}