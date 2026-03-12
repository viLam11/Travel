package com.travollo.Travel.domains.chat.repo;

import com.travollo.Travel.domains.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
            "ORDER BY m.createdAt DESC") // Bắt buộc phải là DESC để lấy tin mới nhất
    Page<ChatMessage> findChatHistory(
            @Param("user1Id") String user1Id,
            @Param("user2Id") String user2Id,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.isRead = false")
    void markMessagesAsRead(@Param("senderId") String senderId, @Param("receiverId") String receiverId);

    @Query("""
    SELECT m FROM ChatMessage m
    WHERE m.createdAt IN (
        SELECT MAX(m2.createdAt)
        FROM ChatMessage m2
        WHERE m2.sender.id = :userId OR m2.receiver.id = :userId
        GROUP BY CASE
            WHEN m2.sender.id = :userId THEN m2.receiver.id
            ELSE m2.sender.id
        END
    )
    ORDER BY m.createdAt DESC
    """)
    List<ChatMessage> findLastMessagesForUser(@Param("userId") String userId);
}
