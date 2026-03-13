package com.travollo.Travel.domains.notifications.service;

import com.travollo.Travel.domains.notifications.entity.Notification;
import com.travollo.Travel.domains.notifications.entity.NotificationType;
import com.travollo.Travel.domains.notifications.repo.NotificationRepo;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepo notificationRepository;

    /**
     * Hàm dùng chung để hệ thống gọi khi muốn tạo thông báo mới
     */
    @Transactional
    public Notification createNotification(User user, NotificationType type, String title, String content, Order referenceOrder) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .referenceOrder(referenceOrder)
                .isRead(false)
                .build();

        log.info("Đã tạo thông báo thành công cho User: {}", user.getUserID());
        return notificationRepository.save(notification);
    }

    /**
     * Lấy da;nh sách thông báo của User (có phân trang)
     */
    public Page<Notification> getUserNotifications(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Lấy số lượng thông báo chưa đọc (để hiển thị số màu đỏ trên icon chuông FE)
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * User bấm vào 1 thông báo cụ thể -> Đánh dấu nó là đã đọc
     */
    @Transactional
    public void markAsRead(String notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));

        // Check permission
        if (!notification.getUser().getUserID().equals(user.getUserID())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên thông báo này");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    /**
     * User bấm nút "Đánh dấu tất cả là đã đọc"
     */
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUser(user);
    }
}
