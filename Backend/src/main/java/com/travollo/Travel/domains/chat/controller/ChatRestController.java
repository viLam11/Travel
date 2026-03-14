package com.travollo.Travel.domains.chat.controller;
import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.chat.dto.ChatMessageResponseDTO;
import com.travollo.Travel.domains.chat.service.ChatService;

import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private final ChatService chatService;

    @GetMapping("/history/{receiverId}")
    public ResponseEntity<PageResponse<ChatMessageResponseDTO>> getHistory(
        @PathVariable String receiverId,
        @CurrentUser User currentUser,
        @RequestParam(value = "pageNo", defaultValue = "0", required = false) int pageNo,
        @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize
    ){
        System.out.println("Hello Devtools!");
        return ResponseEntity.ok(chatService.getChatHistory(currentUser.getUserID(), receiverId, pageNo, pageSize));
    }

    @GetMapping("/chat-list")
    public ResponseEntity<List<ChatMessageResponseDTO>> getChatList(@CurrentUser User currentUser) {
        return ResponseEntity.ok(chatService.getChatList(currentUser));
    }

    @PutMapping("/mark-read/{receiverId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String receiverId,
            @CurrentUser User currentUser
    ) {
        chatService.markMessagesAsRead(receiverId, currentUser.getUserID());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update-content/{messageId}")
    public ResponseEntity<ChatMessageResponseDTO> updateMessageContent(
            @PathVariable String messageId,
            @RequestBody String newContent,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(chatService.updateMessageContent(messageId, newContent, currentUser));
    }

    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String messageId,
            @CurrentUser User currentUser
    ) {
        chatService.deleteMessage(messageId, currentUser);
        return ResponseEntity.ok().build();
    }
}