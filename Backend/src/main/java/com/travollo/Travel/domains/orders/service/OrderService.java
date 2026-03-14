package com.travollo.Travel.domains.orders.service;

import com.travollo.Travel.domains.hotel.entity.Room;
import com.travollo.Travel.domains.hotel.repo.RoomRepo;
import com.travollo.Travel.domains.notifications.dto.NotiCreateRequest;
import com.travollo.Travel.domains.notifications.entity.NotificationType;
import com.travollo.Travel.domains.notifications.service.NotificationService;
import com.travollo.Travel.domains.orders.dto.OrderCreateRequest;
import com.travollo.Travel.domains.orders.entity.Order;
import com.travollo.Travel.domains.orders.entity.OrderStatus;
import com.travollo.Travel.domains.orders.entity.OrderedRoom;
import com.travollo.Travel.domains.orders.entity.OrderedTicket;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.entity.Discount;
import com.travollo.Travel.domains.promotions.entity.FixedPriceDiscount;
import com.travollo.Travel.domains.promotions.entity.PercentageDiscount;
import com.travollo.Travel.domains.promotions.repo.DiscountRepo;
import com.travollo.Travel.domains.promotions.service.DiscountService;
import com.travollo.Travel.domains.ticket.repo.TicketRepo;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.OrderRepo;
import com.travollo.Travel.repo.OrderedTicketRepo;
import com.travollo.Travel.service.impl.MomoServiceImp;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepo orderRepo;
    private final TicketRepo ticketRepo;
    private final RoomRepo roomRepo;
    private final MomoServiceImp momoService;
    private final OrderedTicketRepo orderedTicketRepo;
    private final DiscountRepo discountRepo;
    private final DiscountService discountService;
    private final NotificationService notiService;

    public ResponseEntity<Object> getOrderById(String id) {
        Optional<Order> foundOrder = orderRepo.findById(id);
        System.out.println("Found order " + foundOrder);
        return foundOrder.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<List<DiscountResponse>> getAllDiscountById(String id, String placeCode) {
        return ResponseEntity.ok(discountService.getSatisfiedDiscount(id, placeCode));
    }

    /**
     * Create a new order based on the provided OrderRequest and User.
     * This method performs the following steps:
     * 1. Initializes a new Order object and sets its properties.
     * 2. Converts the list of ticket items in the OrderRequest to a list of OrderedTicket entities.
     * 3. Converts the list of room items in the OrderRequest to a list of OrderedRoom entities.
     * 4. Assigns the lists of OrderedTicket and OrderedRoom to the Order for cascading persistence.
     * 5. Applies discounts and calculates the total price, discount price, final price, and deposit.
     * 6. Saves the Order to the database, which also saves the associated OrderedTicket and OrderedRoom entities due to CascadeType.ALL.
     * 7. Creates a payment link using the MoMo service and returns it in the response.
     *
     */
    @Transactional
    public ResponseEntity<Object> createOrder(OrderCreateRequest orderCreateRequest, User user) {
        try {
            // 0. Validate constraints: max 2 discounts
            if (orderCreateRequest.getDiscountIds().size() > 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chỉ được áp dụng tối đa 2 mã giảm giá!");
            }
            for (String discountId : orderCreateRequest.getDiscountIds()) {
                if (!discountRepo.existsById(discountId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã giảm giá không tồn tại: " + discountId);
                }
            }
            if (orderCreateRequest.getDiscountIds().size() == 2) {
                List<Discount> discounts = orderCreateRequest.getDiscountIds().stream()
                        .map(id -> discountRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Discount ID: " + id)))
                        .toList();
                if (discounts.get(0).getIsSystem() == discounts.get(1).getIsSystem()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Hai mã giảm giá không được áp dụng cùng loại (1 của hệ thống, 1 của doanh nghiệp)!");
                }
            }
//            if (orderCreateRequest.getCheckInDate().isAfter(orderCreateRequest.getCheckOutDate())) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ngày check-in phải trước ngày check-out!");
//            }
            if (orderCreateRequest.getTickets().isEmpty() && orderCreateRequest.getRooms().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Đơn hàng phải có ít nhất một vé hoặc một phòng!");
            }
            // 1. Khởi tạo đối tượng Order
            Order newOrder = new Order();
            newOrder.setCreatedAt(LocalDateTime.now());
            newOrder.setStatus(OrderStatus.PENDING);
            newOrder.setGuestPhone(orderCreateRequest.getGuestPhone());
            newOrder.setNote(orderCreateRequest.getNote());
            newOrder.setUser(user);

            List<OrderedTicket> orderedTickets = new ArrayList<>();
            List<OrderedRoom> orderedRooms = new ArrayList<>();
            // 2. Chuyển đổi và thiết lập danh sách OrderedTicket
            // QUAN TRỌNG: Phải setOrder(newOrder) cho từng ticket
            if (!orderCreateRequest.getTickets().isEmpty()) {
                orderedTickets = orderCreateRequest.getTickets().stream().map(ticketItem -> {
                    Ticket ticketEntity = ticketRepo.findById(ticketItem.getId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy Ticket ID: " + ticketItem.getId()));
                    OrderedTicket ot = new OrderedTicket();
                    ot.setTicket(ticketEntity);
                    ot.setAmount(ticketItem.getQuantity());
                    ot.setPrice(ticketEntity.getPrice().multiply(BigDecimal.valueOf(ticketItem.getQuantity())));
                    ot.setValidStart(ticketItem.getCheckInDate());
                    ot.setValidEnd(ticketItem.getCheckOutDate());
                    ot.setCreatedAt(LocalDateTime.now());
                    // DÒNG NÀY QUYẾT ĐỊNH VIỆC CÓ LƯU ĐƯỢC LIÊN KẾT HAY KHÔNG
                    ot.setOrder(newOrder);
                    return ot;
                }).collect(Collectors.toList());
            }

            if (!orderCreateRequest.getRooms().isEmpty()) {
                // 3. Chuyển đổi và thiết lập danh sách OrderedRoom (Tương tự Ticket)
                orderedRooms = orderCreateRequest.getRooms().stream().map(roomItem -> {
                    Room roomEntity = roomRepo.findById(roomItem.getId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy Room ID: " + roomItem.getId()));
                    OrderedRoom or = new OrderedRoom();
                    or.setRoom(roomEntity);
                    or.setAmount(roomItem.getQuantity());
                    or.setPrice(roomEntity.getPrice().multiply(BigDecimal.valueOf(roomItem.getQuantity())));
                    or.setStartDate(roomItem.getCheckInDate());
                    or.setEndDate(roomItem.getCheckOutDate());
                    or.setCreatedAt(LocalDateTime.now());
                    // THIẾT LẬP LIÊN KẾT
                    or.setOrder(newOrder);
                    return or;
                }).collect(Collectors.toList());
            }

            // 4. Gán danh sách vào Order để Cascade tự động lưu
            newOrder.setOrderedTickets(orderedTickets);
            newOrder.setOrderedRooms(orderedRooms);

            // 5. Apply discount
            System.out.println("Calculating total price before discount...");
            // 5. Tính toán tổng tiền theo thứ tự discounts: Hệ thống -> Doanh nghiệp
            BigDecimal totalTicketPrice = orderedTickets.stream()
                    .map(OrderedTicket::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            System.out.println("Total ticket price: " + totalTicketPrice);

            BigDecimal totalRoomPrice = orderedRooms.stream()
                    .map(OrderedRoom::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPrice = totalTicketPrice.add(totalRoomPrice);
            BigDecimal totalDiscountAmount = BigDecimal.ZERO;

            System.out.println("Total room price: " + totalRoomPrice);
            log.info("Bắt đầu tính toán đơn hàng. Giá gốc: {}", totalPrice);

            // Lấy danh sách discount từ DB (Sử dụng findById để tránh Lazy loading proxy nếu cần tính toán ngay)
            List<Discount> discountList = orderCreateRequest.getDiscountIds().stream()
                    .map(id -> discountRepo.findById(id)
                            .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy mã giảm giá: " + id)))
                    .collect(Collectors.toList());
            newOrder.setDiscountList(discountList);
            if (!discountList.isEmpty()) {
                // Sắp xếp: Ưu tiên mã Hệ thống (isSystem = true) lên đầu để tính trước
                discountList.sort((d1, d2) -> Boolean.compare(d2.getIsSystem(), d1.getIsSystem()));

                for (Discount discount : discountList) {
                    BigDecimal currentDiscountVal = BigDecimal.ZERO;
                    if (discount instanceof FixedPriceDiscount fixed) {
                        currentDiscountVal = BigDecimal.valueOf(fixed.getFixedPrice());
                    } else if (discount instanceof PercentageDiscount pct) {
                        BigDecimal percentage = BigDecimal.valueOf(pct.getPercentage());
                        currentDiscountVal = totalPrice.multiply(percentage)
                                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
                    }
                    totalDiscountAmount = totalDiscountAmount.add(currentDiscountVal);
                    totalPrice = totalPrice.subtract(currentDiscountVal);
                    log.info("Áp dụng mã {}: -{}. Giá còn lại: {}",
                            discount.getIsSystem() ? "HỆ THỐNG" : "DOANH NGHIỆP",
                            currentDiscountVal,
                            totalPrice);
                }
            }

            // Đảm bảo giá cuối cùng không âm
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                totalPrice = BigDecimal.ZERO;
            }

            // Lưu giá trị vào object Order
            newOrder.setTotalPrice(totalPrice);
            newOrder.setDiscountPrice(totalDiscountAmount);

            log.info("Hoàn tất tính toán. Tổng giảm giá: {}. Giá cuối cùng: {}", totalDiscountAmount, totalPrice);

            // 6. LƯU ORDER (Nhờ CascadeType.ALL trong Order.java, Ticket và Room sẽ tự được lưu)
            Order savedOrder = orderRepo.save(newOrder);

            handleNotifyOwnersAfterOrdering(user, orderCreateRequest, savedOrder);
            // 7. Tạo link thanh toán MoMo
            Map<String, Object> result = momoService.createPayment(newOrder.getOrderID(), newOrder.getTotalPrice().longValue());
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo đơn hàng: " + e.getMessage());
        }
    }

    @Transactional
    public void handleNotifyOwnersAfterOrdering(User customer, OrderCreateRequest request, Order savedOrder) {
        // 1. Khai báo 1 Set để chứa các chủ dịch vụ (dùng Set để tự động lọc trùng)
        Set<User> providersToNotify = new HashSet<>();

        // 2. Xử lý danh sách Room
        List<Room> orderedRooms = request.getRooms().stream().map(roomItem -> {
            Room roomEntity = roomRepo.findById(roomItem.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Room ID: " + roomItem.getId()));

            if (roomEntity.getHotel() != null && roomEntity.getHotel().getProvider() != null) {
                providersToNotify.add(roomEntity.getHotel().getProvider());
            }

            return roomEntity;
        }).toList();


        // 3. Xử lý danh sách Ticket
        List<Ticket> orderedTickets = request.getTickets().stream().map(ticketItem -> {
            Ticket ticketEntity = ticketRepo.findById(ticketItem.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Ticket ID: " + ticketItem.getId()));

            if (ticketEntity.getTicketVenue() != null && ticketEntity.getTicketVenue().getProvider() != null) {
                providersToNotify.add(ticketEntity.getTicketVenue().getProvider());
            }

            return ticketEntity;
        }).toList();

        // 4. Bắn thông báo cho các chủ dịch vụ sau khi đơn hàng đã được tạo thành công
        for (User provider : providersToNotify) {
            NotiCreateRequest notiReq = NotiCreateRequest.builder()
                    .receiverID(provider.getUserID())
                    .type(NotificationType.NEW_ORDER)
                    .title("Có đơn đặt dịch vụ mới!")
                    .content("Khách hàng vừa đặt dịch vụ trên hệ thống. Mã đơn: " + savedOrder.getOrderID())
                    .referenceOrderID(savedOrder.getOrderID())
                    .build();

            // Gọi NotificationService để lưu thông báo
            notiService.createNotification(customer, notiReq);
        }
    }

    //    public ResponseEntity<Object> createOrder(CreateOrder createOrder, User user) {
//        try {
//            List<OrderItem> tickets = createOrder.getTickets();
//            List<OrderItem> rooms = createOrder.getRooms();
//            LocalDateTime checkInDate = createOrder.getCheckInDate();
//            LocalDateTime checkOutDate = createOrder.getCheckOutDate();
//            String guestPhone = createOrder.getGuestPhone();
//            String note = createOrder.getNote();
//            List<Long> discountIds = createOrder.getDiscountIds();
//
//            List<OrderedTicket> orderedTickets = tickets.stream().map(ticket -> {
//                OrderedTicket orderedTicket = new OrderedTicket();
//                try {
//                    Ticket ticketService = ticketRepo.findById(ticket.getId()).orElseThrow(() -> new Exception("Ticket not found: " + ticket.getId()));
//                    orderedTicket.setTicket(ticketService);
//                    orderedTicket.setAmount(ticket.getQuantity());
//                    BigDecimal price = ticketService.getPrice();
//                    orderedTicket.setPrice( price.multiply(BigDecimal.valueOf(ticket.getQuantity())));
//                    orderedTicket.setValidStart(createOrder.getCheckInDate());
//                    orderedTicket.setValidEnd(createOrder.getCheckOutDate());
//                    orderedTicket.setCreatedAt(java.time.LocalDateTime.now());
//                } catch (Exception e) {
//                    e.printStackTrace();
//                }
//                return orderedTicket;
//            }).toList();
//
//            orderedTicketRepo.saveAll(orderedTickets);
//
//            List<OrderedRoom> orderedRooms = rooms.stream().map(roomItem -> {;
//                OrderedRoom orderedRoom = new OrderedRoom();
//                try {
//                    Room roomService = roomRepo.findById(roomItem.getId()).orElseThrow(() -> new Exception("Ticket not found: " + roomItem.getId()));
//                    orderedRoom.setRoom(roomService);
//                    orderedRoom.setAmount(roomItem.getQuantity());
//                    BigDecimal price = roomService.getPrice();
//                    orderedRoom.setPrice( price.multiply(BigDecimal.valueOf(roomItem.getQuantity())));
//                    orderedRoom.setStartDate(createOrder.getCheckInDate());
//                    orderedRoom.setEndDate(createOrder.getCheckOutDate());
//                    orderedRoom.setCreatedAt(java.time.LocalDateTime.now());
//                } catch (Exception e) {
//                    e.printStackTrace();
//                }
//                return orderedRoom;
//            }).toList();
//
//            Order newOrder = new Order();
//            newOrder.setCreatedAt(LocalDateTime.now());
//            newOrder.setStatus("PENDING");
//            newOrder.setGuestPhone(guestPhone);
//            newOrder.setNote(note);
//            newOrder.setUser(user);
//            newOrder.setOrderedTickets(orderedTickets);
//            newOrder.setOrderedRooms(orderedRooms);
//            BigDecimal totalPrice =
//                    orderedTickets.stream()
//                        .map(ticket -> ticket.getPrice())
//                        .reduce(BigDecimal.ZERO, BigDecimal::add)
//                    .add(
//                    orderedRooms.stream()
//                            .map(room -> room.getPrice().multiply(BigDecimal.valueOf(0.3))) // Nhân với 0.3
//                            .reduce(BigDecimal.ZERO, BigDecimal::add));
//
//            newOrder.setTotalPrice(totalPrice);
//            newOrder.setDiscountPrice(BigDecimal.ZERO);
//            newOrder.setFinalPrice(totalPrice.subtract(newOrder.getDiscountPrice()));
//            newOrder.setDeposit(totalPrice.multiply(BigDecimal.valueOf(0.3)));
//
//            orderRepo.save(newOrder);
//
//            Map<String, Object> result =   momoService.createPayment(newOrder.getOrderID(), newOrder.getTotalPrice().longValue());
//            return new ResponseEntity<>(result, HttpStatus.OK);
//
//            return new ResponseEntity<>("OK", HttpStatus.OK);
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
//        }
//    }
//
    public Order updateOrderStatus(String orderID, OrderStatus status) {
        System.out.println("ORDER ID: " + orderID);
        Order order = orderRepo.findById(orderID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not exist"));
        order.setStatus(status);
        orderRepo.save(order);
        return orderRepo.save(order);
    }

    public Page<Order> getAllOrderByUser(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return orderRepo.findByUser(user, pageable);
    }

}
