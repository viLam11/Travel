package com.travollo.Travel.domains.notifications.repo;

import com.travollo.Travel.domains.notifications.entity.Notification;
import com.travollo.Travel.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, String> {
    @Query("SELECT n FROM Notification n WHERE n.receiver.id = :userId OR n.receiver IS NULL ORDER BY n.createdAt DESC")
    Page<Notification> findAllForUserOrderByCreatedAtDesc(@Param("userId") String userId, Pageable pageable);

    long countByReceiverAndIsReadFalse(User receiver);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiver = :user AND n.isRead = false")
    void markAllAsReadByUser(@Param("user") User user);

    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiver.id = :userID AND n.id = :notiID AND n.isRead = false")
    void markRead(@Param("userID") String userID, @Param("notiID") String notiID);
}
