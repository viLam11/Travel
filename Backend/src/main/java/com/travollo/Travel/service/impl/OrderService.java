package com.travollo.Travel.service.impl;

import com.travollo.Travel.dto.order.CreateOrder;
import com.travollo.Travel.dto.order.OrderItem;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.repo.OrderRepo;
import com.travollo.Travel.repo.RoomRepo;
import com.travollo.Travel.repo.TicketRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private MomoServiceImp momoService;


    public ResponseEntity<Object> getOrderById(String id) {
        Optional<Order> foundOrder = orderRepo.findById(id);
        System.out.println("Found order " + foundOrder.toString());

        return foundOrder.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<Object> createOrder(CreateOrder createOrder, User user) {
        try {
            List<OrderItem> tickets = createOrder.getTickets();
            List<OrderItem> rooms = createOrder.getRooms();
            LocalDateTime checkInDate = createOrder.getCheckInDate();
            LocalDateTime checkOutDate = createOrder.getCheckOutDate();
            String guestPhone = createOrder.getGuestPhone();
            String note = createOrder.getNote();
            List<Long> discountIds = createOrder.getDiscountIds();

            List<OrderedTicket> orderedTickets = tickets.stream().map(ticket -> {
                OrderedTicket orderedTicket = new OrderedTicket();
                try {
                    Ticket ticketService = ticketRepo.findById(ticket.getId()).orElseThrow(() -> new Exception("Ticket not found: " + ticket.getId()));
                    orderedTicket.setTicket(ticketService);
                    orderedTicket.setAmount(ticket.getQuantity());
                    BigDecimal price = ticketService.getPrice();
                    orderedTicket.setPrice( price.multiply(BigDecimal.valueOf(ticket.getQuantity())));
                    orderedTicket.setValidStart(createOrder.getCheckInDate());
                    orderedTicket.setValidEnd(createOrder.getCheckOutDate());
                    orderedTicket.setCreatedAt(java.time.LocalDateTime.now());
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return orderedTicket;
            }).toList();
            List<OrderedRoom> orderedRooms = rooms.stream().map(roomItem -> {;
                OrderedRoom orderedRoom = new OrderedRoom();
                try {
                    Room roomService = roomRepo.findById(roomItem.getId()).orElseThrow(() -> new Exception("Ticket not found: " + roomItem.getId()));
                    orderedRoom.setRoom(roomService);
                    orderedRoom.setAmount(roomItem.getQuantity());
                    BigDecimal price = roomService.getPrice();
                    orderedRoom.setPrice( price.multiply(BigDecimal.valueOf(roomItem.getQuantity())));
                    orderedRoom.setStartDate(createOrder.getCheckInDate());
                    orderedRoom.setEndDate(createOrder.getCheckOutDate());
                    orderedRoom.setCreatedAt(java.time.LocalDateTime.now());
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return orderedRoom;
            }).toList();

            Order newOrder = new Order();
            newOrder.setCreatedAt(LocalDateTime.now());
            newOrder.setStatus("PENDING");
            newOrder.setGuestPhone(guestPhone);
            newOrder.setNote(note);
            newOrder.setUser(user);
            newOrder.setOrderedTickets(orderedTickets);
            newOrder.setOrderedRooms(orderedRooms);
            BigDecimal totalPrice =
                    orderedTickets.stream()
                        .map(ticket -> ticket.getPrice())
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .add(
                    orderedRooms.stream()
                            .map(room -> room.getPrice().multiply(BigDecimal.valueOf(0.3))) // Nhân với 0.3
                            .reduce(BigDecimal.ZERO, BigDecimal::add));

            newOrder.setTotalPrice(totalPrice);
            newOrder.setDiscountPrice(BigDecimal.ZERO);
            newOrder.setFinalPrice(totalPrice.subtract(newOrder.getDiscountPrice()));
            newOrder.setDeposit(totalPrice.multiply(BigDecimal.valueOf(0.3)));

            orderRepo.save(newOrder);

            Map<String, Object> result =   momoService.createPayment(newOrder.getOrderID(), newOrder.getDeposit().longValue());
            return new ResponseEntity<>(result, HttpStatus.OK);

//            return new ResponseEntity<>("OK", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
        }
    }

}
