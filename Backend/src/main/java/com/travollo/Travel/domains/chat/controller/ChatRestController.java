package com.travollo.Travel.domains.chat.controller;
import com.travollo.Travel.domains.chat.dto.ChatMessageResponseDTO;
import com.travollo.Travel.domains.chat.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private final ChatService chatService;

    @GetMapping("/history/{receiverId}")
    public ResponseEntity<List<ChatMessageResponseDTO>> getHistory(
            @PathVariable String receiverId,
            Principal principal) {

        // principal.getName() chính là Email của người đang đăng nhập (lấy từ Token)
        String currentUserEmail = principal.getName();
        System.out.println("GET PRINCIPAL NAME " + currentUserEmail);

        List<ChatMessageResponseDTO> history = chatService.getChatHistory(currentUserEmail, receiverId);
        return ResponseEntity.ok(history);
    }

    @PutMapping("/mark-read/{senderId}")
    public ResponseEntity<Void> markAsRead(@PathVariable String senderId, Principal principal) {
        String currentUserId = principal.getName();
        chatService.markMessagesAsRead(senderId, currentUserId);
        return ResponseEntity.ok().build();
    }
}