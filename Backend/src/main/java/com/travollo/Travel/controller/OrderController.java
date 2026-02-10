package com.travollo.Travel.controller;

import com.travollo.Travel.domains.orders.dto.OrderRequest;
import com.travollo.Travel.domains.orders.service.OrderService;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
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
    public ResponseEntity<Object> createOrder(@RequestBody OrderRequest createOrder) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (user.getRole() != Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Must be USER to create order");
        }

        return orderService.createOrder(createOrder, user);
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getOrdersByUser(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (user.getRole() != Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Must be USER to view orders");
        }

        return orderService.getAllOrderByUser(user, page, size);
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