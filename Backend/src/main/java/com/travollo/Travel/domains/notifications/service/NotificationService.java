package com.travollo.Travel.domains.notifications.service;

import com.travollo.Travel.domains.notifications.dto.NotiCreateRequest;
import com.travollo.Travel.domains.notifications.dto.NotiUpdateRequest;
import com.travollo.Travel.domains.notifications.entity.Notification;
import com.travollo.Travel.domains.notifications.repo.NotificationRepo;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.OrderRepo;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.utils.Role;
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
    private final NotificationMapper notificationMapper;
    private final UserRepo userRepo;
    private final OrderRepo orderRepo;
    /**
     * Hàm dùng chung để hệ thống gọi khi muốn tạo thông báo mới
     */
    @Transactional
    public Notification createNotification(User user, NotiCreateRequest newNoti) {
        Notification notification = Notification.builder()
                .creator(user)
                .type(newNoti.getType())
                .title(newNoti.getTitle())
                .content(newNoti.getContent())
                .isRead(false)
                .build();

        if (newNoti.getReceiverID() != null) {
            notification.setReceiver(userRepo.findById(newNoti.getReceiverID()).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Invalid userID")));
        }
        if (newNoti.getReferenceOrderID() != null) {
            Order referenceOrder = orderRepo.getReferenceById(newNoti.getReferenceOrderID());
            notification.setReferenceOrder(referenceOrder);
        }

        log.info("Đã tạo thông báo thành công cho User: {}", user.getUserID());
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification updateNotification(User requestingUser, NotiUpdateRequest updateRequest, String notifID){
        Notification existingNotification = notificationRepository.findById(notifID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found Notification"));
        if (requestingUser.getRole() != Role.ADMIN && !requestingUser.getUserID().equals(existingNotification.getCreator().getUserID())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "User has not permission to update this notification");
        }

        notificationMapper.patchNotification(updateRequest, existingNotification);
        return notificationRepository.save(existingNotification);
    }

    /**
     * Lấy danh sách thông báo của User (có phân trang)
     */
    public Page<Notification> getUserNotifications(String userID, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findAllForUserOrderByCreatedAtDesc(userID, pageable);
    }

    /**
     * Lấy số lượng thông báo chưa đọc (để hiển thị số màu đỏ trên icon chuông FE)
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByReceiverAndIsReadFalse(user);
    }

    /**
     * User bấm vào 1 thông báo cụ thể -> Đánh dấu nó là đã đọc
     */
    @Transactional
    public void markAsRead(String notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));

        // Check permission
        if (!notification.getCreator().getUserID().equals(user.getUserID())) {
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
