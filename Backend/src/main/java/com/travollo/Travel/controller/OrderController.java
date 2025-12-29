package com.travollo.Travel.controller;

import com.travollo.Travel.dto.order.CreateOrder;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.impl.OrderService;
import com.travollo.Travel.utils.Role;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/orders")
//@PreAuthorize("hasRole('ADMIN')")
public class OrderController {
//    @Autowired
//    private OrderServic e   orderService;

    @Autowired
    private UserRepo userRepo;

    @GetMapping("/test")
    public  String test(){
        return "ORDER TEST";
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrderById(
            @PathVariable String id
    ) {
        return orderService.getOrderById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<Object> createOrder(
            @RequestBody CreateOrder createOrder,
            HttpServletRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user_email = authentication.getName();
        System.out.println("User gửi request này là: " + user_email);
        Optional<User> user = userRepo.findByEmail(user_email);
        if (user.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        } else {
            if (user.get().getRole() != Role.USER) {
                return ResponseEntity.status(403).body("Must be USER to create order");
            }
        }

        return orderService.createOrder(createOrder, user.get());
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getOrdersByUser(
            int page,
            int size,
            HttpServletRequest request
    ){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user_email = authentication.getName();
        System.out.println("User gửi request này là: " + user_email);
        Optional<User> user = userRepo.findByEmail(user_email);
        if (user.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        } else {
            if (user.get().getRole() != Role.USER) {
                return ResponseEntity.status(403).body("Must be USER to create order");
            }
        }

        return orderService.getAllOrderByUser(user.get(), page, size);
    }
}
