package com.travollo.Travel.domains.orders.controller;

import com.travollo.Travel.domains.notifications.dto.NotiCreateRequest;
import com.travollo.Travel.domains.notifications.entity.NotificationType;
import com.travollo.Travel.domains.notifications.service.NotificationService;
import com.travollo.Travel.domains.orders.dto.OrderCreateRequest;
import com.travollo.Travel.domains.orders.dto.OrderResponse;
import com.travollo.Travel.domains.orders.entity.Order;
import com.travollo.Travel.domains.orders.entity.OrderStatus;
import com.travollo.Travel.domains.orders.service.OrderService;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.utils.CurrentUser;
import com.travollo.Travel.utils.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final NotificationService notificationService;
    private final UserRepo userRepo;

    @GetMapping("/test")
    public String test() {
        return "ORDER TEST";
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<Object> createOrder(@RequestBody OrderCreateRequest createOrder) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (user.getRole() != Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Must be USER to create order");
        }

        return orderService.createOrder(createOrder, user);
    }

    @PatchMapping("/{orderID}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String orderID,
            @RequestBody OrderStatus newStatus,
            @CurrentUser User currentUser
            ) {
        Order updatedOrder = orderService.updateOrderStatus(orderID, newStatus);

        try {
            NotiCreateRequest notiRequest = new NotiCreateRequest();
            notiRequest.setReferenceOrderID(updatedOrder.getOrderID());
            String role = currentUser.getRole().name();

            if (role.equals("ADMIN") || role.startsWith("PROVIDER")) {
                // Trình trạng 1: Provider/Admin đổi trạng thái -> Báo cho Khách hàng
                notiRequest.setType(newStatus == OrderStatus.ACCEPTED ? NotificationType.ORDER_ACCEPTED : NotificationType.ORDER_CANCELED);
                notiRequest.setTitle("Cập nhật trạng thái đơn hàng");
                notiRequest.setContent("Đơn hàng " + updatedOrder.getOrderID() + " của bạn đã chuyển sang trạng thái: " + newStatus.name());
                notiRequest.setReceiverID(updatedOrder.getUser().getUserID()); // Gửi cho chủ đơn hàng

                notificationService.createNotification(currentUser, notiRequest);
            } else if (role.equals("USER")) {
                // Trình trạng 2: Khách hàng tự đổi (VD: Hủy đơn) -> Báo lại cho chính khách hàng
                notiRequest.setTitle("Cập nhật đơn hàng thành công");
                notiRequest.setContent("Bạn đã đổi trạng thái đơn hàng " + updatedOrder.getOrderID() + " thành: " + newStatus.name());
                notiRequest.setReceiverID(currentUser.getUserID());

                notificationService.createNotification(currentUser, notiRequest);

                // 2.2 Báo cho Provider biết khách vừa cập nhật đơn
                String providerId = null;
                if (!updatedOrder.getOrderedRooms().isEmpty()) {
                    // Lấy chủ của Hotel từ phòng đầu tiên trong đơn
                    providerId = updatedOrder.getOrderedRooms().get(0).getRoom().getHotel().getProvider().getUserID();
                } else if (!updatedOrder.getOrderedTickets().isEmpty()) {
                    // Lấy chủ của Venue/Service từ vé đầu tiên trong đơn
                     providerId = updatedOrder.getOrderedTickets().get(0).getTicket().getTicketVenue().getProvider().getUserID();
                }

                if (providerId != null) {
                    NotiCreateRequest providerNoti = new NotiCreateRequest();
                    providerNoti.setReferenceOrderID(updatedOrder.getOrderID());
                    providerNoti.setType(NotificationType.ORDER_CANCELED);
                    providerNoti.setTitle("Khách hàng đã thay đổi đơn hàng");
                    providerNoti.setContent("Khách hàng vừa đổi trạng thái đơn hàng " + updatedOrder.getOrderID() + " thành: " + newStatus.name());
                    providerNoti.setReceiverID(providerId);

                    notificationService.createNotification(currentUser, providerNoti);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi tạo thông báo cho đơn hàng {}: {}", orderID, e.getMessage());
        }

        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/all")
    public Page<Order> getOrdersByUser(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @CurrentUser User currentUser
    ) {
        return orderService.getAllOrderByUser(currentUser, page, size);
    }
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String userEmail = authentication.getName();
        return userRepo.findByEmail(userEmail).orElse(null);
    }
}