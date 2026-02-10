package com.travollo.Travel.domains.orders.service;

import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.entity.Discount;
import com.travollo.Travel.domains.promotions.repo.DiscountRepo;
import com.travollo.Travel.domains.promotions.service.DiscountService;
import com.travollo.Travel.dto.SuccessResponse;
import com.travollo.Travel.domains.orders.dto.OrderRequest;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.OrderRepo;
import com.travollo.Travel.repo.OrderedTicketRepo;
import com.travollo.Travel.repo.RoomRepo;
import com.travollo.Travel.repo.TicketRepo;
import com.travollo.Travel.service.impl.MomoServiceImp;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepo orderRepo;
    private final TicketRepo ticketRepo;
    private final RoomRepo roomRepo;
    private final MomoServiceImp momoService;
    private final OrderedTicketRepo orderedTicketRepo;
    private final DiscountRepo discountRepo;
    private final DiscountService discountService;

    public ResponseEntity<Object> getOrderById(String id) {
        Optional<Order> foundOrder = orderRepo.findById(id);
        System.out.println("Found order " + foundOrder.toString());
        return foundOrder.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<List<DiscountResponse>> getAllDiscountById(String id, String placeCode) {
        return ResponseEntity.ok(discountService.getSatisfiedDiscount(id, placeCode));
    }

    @Transactional
    public ResponseEntity<Object> createOrder(OrderRequest orderRequest, User user) {
        try {
            // 1. Khởi tạo đối tượng Order
            Order newOrder = new Order();
            newOrder.setCreatedAt(LocalDateTime.now());
            newOrder.setStatus("PENDING");
            newOrder.setGuestPhone(orderRequest.getGuestPhone());
            newOrder.setNote(orderRequest.getNote());
            newOrder.setUser(user);

            // 2. Chuyển đổi và thiết lập danh sách OrderedTicket
            // QUAN TRỌNG: Phải setOrder(newOrder) cho từng ticket
            List<OrderedTicket> orderedTickets = orderRequest.getTickets().stream().map(ticketItem -> {
                Ticket ticketEntity = ticketRepo.findById(ticketItem.getId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Ticket ID: " + ticketItem.getId()));
                OrderedTicket ot = new OrderedTicket();
                ot.setTicket(ticketEntity);
                ot.setAmount(ticketItem.getQuantity());
                ot.setPrice(ticketEntity.getPrice().multiply(BigDecimal.valueOf(ticketItem.getQuantity())));
                ot.setValidStart(orderRequest.getCheckInDate());
                ot.setValidEnd(orderRequest.getCheckOutDate());
                ot.setCreatedAt(LocalDateTime.now());
                // DÒNG NÀY QUYẾT ĐỊNH VIỆC CÓ LƯU ĐƯỢC LIÊN KẾT HAY KHÔNG
                ot.setOrder(newOrder);
                return ot;
            }).collect(Collectors.toList());

            // 3. Chuyển đổi và thiết lập danh sách OrderedRoom (Tương tự Ticket)
            List<OrderedRoom> orderedRooms = orderRequest.getRooms().stream().map(roomItem -> {
                Room roomEntity = roomRepo.findById(roomItem.getId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Room ID: " + roomItem.getId()));
                OrderedRoom or = new OrderedRoom();
                or.setRoom(roomEntity);
                or.setAmount(roomItem.getQuantity());
                or.setPrice(roomEntity.getPrice().multiply(BigDecimal.valueOf(roomItem.getQuantity())));
                or.setStartDate(orderRequest.getCheckInDate());
                or.setEndDate(orderRequest.getCheckOutDate());
                or.setCreatedAt(LocalDateTime.now());
                // THIẾT LẬP LIÊN KẾT
                or.setOrder(newOrder);
                return or;
            }).collect(Collectors.toList());

            // 4. Gán danh sách vào Order để Cascade tự động lưu
            newOrder.setOrderedTickets(orderedTickets);
            newOrder.setOrderedRooms(orderedRooms);

            // 5. Apply discount
            List<Discount> discountList = orderRequest.getDiscountIds().stream()
                    .map((id) -> discountRepo.getReferenceById(id)).toList();
            newOrder.setDiscountList(discountList);

            // 5. Tính toán tổng tiền
            BigDecimal totalTicketPrice = orderedTickets.stream()
                    .map(OrderedTicket::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalRoomPrice = orderedRooms.stream()
                    .map(OrderedRoom::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalD;
            BigDecimal totalPrice = totalTicketPrice.add(totalRoomPrice.multiply(BigDecimal.valueOf(0.3)));
            newOrder.setTotalPrice(totalPrice);
            newOrder.setDiscountPrice(BigDecimal.ZERO);
            newOrder.setFinalPrice(totalPrice.subtract(newOrder.getDiscountPrice()));
            newOrder.setDeposit(totalPrice.multiply(BigDecimal.valueOf(0.3)));

            // 6. LƯU ORDER (Nhờ CascadeType.ALL trong Order.java, Ticket và Room sẽ tự được lưu)
            orderRepo.save(newOrder);

            // 7. Tạo link thanh toán MoMo
            Map<String, Object> result = momoService.createPayment(newOrder.getOrderID(), newOrder.getTotalPrice().longValue());
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi tạo đơn hàng: " + e.getMessage());
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
    public ResponseEntity<Object> updateOrderStatus(String orderID, String status) {
        System.out.println("ORDER ID: " + orderID);
        Order order = orderRepo.findById(orderID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not exist"));
        String normalizedStatus = status.toUpperCase();

        if (!normalizedStatus.equals("SUCCESS") && !normalizedStatus.equals("FAILED")) {
            throw new CustomException(HttpStatus.BAD_REQUEST,
                    "Dữ liệu không hợp lệ! Status chỉ được phép là 'SUCCESS' hoặc 'FAILED'.");
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new CustomException(HttpStatus.BAD_REQUEST,
                    "Không thể cập nhật! Đơn hàng đã kết thúc với trạng thái: " + order.getStatus());
        }
        order.setStatus(normalizedStatus);
        orderRepo.save(order);
        return ResponseEntity.ok(new SuccessResponse(status + "order"));
    }

    public ResponseEntity<Object> getAllOrderByUser(User user, int page, int size){
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Order> orders = orderRepo.findByUser(user, pageable);

            // 3. Khởi tạo danh sách kết quả (Tránh NullPointerException)
            List<OrderedTicket> allTickets = new ArrayList<>();

            // 4. Duyệt qua từng đơn hàng và gom nhóm vé
            for (Order order : orders) {
                System.out.println("Order ID: " + order.getOrderID() + ", Created At: " + order.getCreatedAt());

                List<OrderedTicket> ticketsOfOrder = orderedTicketRepo.findByOrder(order);
                allTickets.addAll(ticketsOfOrder);
            }

            return ResponseEntity.ok(allTickets);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
