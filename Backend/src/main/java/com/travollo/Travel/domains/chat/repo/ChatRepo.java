package com.travollo.Travel.domains.chat.repo;

import com.travollo.Travel.domains.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepo extends JpaRepository<ChatMessage, String> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
            "(m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR " +
            "(m.sender.id = :user2Id AND m.receiver.id = :user1Id) " +
            "ORDER BY m.createdAt ASC") // Đảm bảo bạn có trường thời gian tạo (createdAt)
    List<ChatMessage> findChatHistory(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.isRead = false")
    void markMessagesAsRead(@Param("senderId") String senderId, @Param("receiverId") String receiverId);
}
