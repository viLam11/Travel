package com.travollo.Travel.domains.notifications.controller;

import com.travollo.Travel.domains.notifications.dto.NotiCreateRequest;
import com.travollo.Travel.domains.notifications.entity.Notification;
import com.travollo.Travel.domains.notifications.service.NotificationService;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("")
    public ResponseEntity<Notification> createNoti(
            @CurrentUser User currentUser,
            @RequestBody NotiCreateRequest createRequest
            ) {
        return ResponseEntity.ok(notificationService.createNotification(currentUser, createRequest));
    }

    /**
     * 1. API cho FE lấy danh sách thông báo để render ra dropdown chuông.
     * Có phân trang: /api/v1/notifications?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getUserNotifications(
            @CurrentUser User currenUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Notification> notifications = notificationService.getUserNotifications(currenUser.getUserID(), page, size);
        return ResponseEntity.ok(notifications);
    }

    /**
     * 2. API lấy con số màu đỏ hiển thị trên icon quả chuông.
     * FE có thể gọi API này định kỳ (polling) hoặc gọi lúc vừa load trang.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = notificationService.getUnreadCount(currentUser);
        return ResponseEntity.ok(count);
    }

    /**
     * 3. API đánh dấu 1 thông báo là đã đọc (Khi user click vào dòng thông báo).
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {

        notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok().build(); // Trả về 200 OK là đủ
    }

    /**
     * 4. API cho nút "Đánh dấu tất cả là đã đọc" (Mark all as read).
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }
}
