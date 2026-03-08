package com.travollo.Travel.domains.chat.controller;

import com.travollo.Travel.domains.chat.dto.ChatMessageDTO;
import com.travollo.Travel.domains.chat.entity.BroadcastMessage;
import com.travollo.Travel.domains.chat.entity.ChatMessage;
import com.travollo.Travel.domains.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatMessageService;


    // --------------------------------------------------------
    // 1. KÊNH BROADCAST (Thông báo chung)
    // --------------------------------------------------------

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public BroadcastMessage sendMessage(
            @Payload BroadcastMessage broadcastMessage
    ) {
        // Có thể gọi repository để lưu broadcastMessage vào DB ở đây
        return broadcastMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public BroadcastMessage addUser(
            @Payload BroadcastMessage broadcastMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // Thêm username vào websocket session
        headerAccessor.getSessionAttributes().put("username", broadcastMessage.getSender());
        return broadcastMessage;
    }

    // --------------------------------------------------------
    // 2. KÊNH PRIVATE (Chat 1-1)
    // --------------------------------------------------------

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessageDTO payload, Principal principal) {
        // 1. IN LOG ĐỂ KIỂM TRA DỮ LIỆU
        System.out.println("--- BẮT ĐẦU XỬ LÝ TIN NHẮN 1-1 ---");
        System.out.println("Người gửi (Principal từ Token): " + (principal != null ? principal.getName() : "NULL"));
        System.out.println("Nội dung Payload nhận được: " + payload.toString());
        System.out.println("ID người nhận: " + payload.getReceiverId());


        if (payload.getReceiverId() == null || payload.getReceiverId().isEmpty()) {
            System.err.println("LỖI: Receiver ID bị null. Từ chối lưu và gửi tin.");
            return;
        }

        try {
            if (principal != null && payload.getSenderId() == null) {
                payload.setSenderId(principal.getName());
            }

            // 4. Lưu tin nhắn vào Database
            ChatMessage savedMessage = chatMessageService.saveMessage(payload);
            System.out.println("Lưu Database thành công. Message ID: " + savedMessage.getId());

            // 5. Định tuyến tin nhắn đến người nhận
            messagingTemplate.convertAndSendToUser(
                    payload.getReceiverId(),
                    "/queue/messages",
                    payload
            );
            System.out.println("Đã chuyển tin nhắn vào Queue cho user: " + payload.getReceiverId());

        } catch (Exception e) {
            System.err.println("Lỗi trong quá trình xử lý tin nhắn: " + e.getMessage());
            e.printStackTrace();
        }
    }
}