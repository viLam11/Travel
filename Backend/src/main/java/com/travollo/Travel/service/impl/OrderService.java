package com.travollo.Travel.service.impl;

import com.travollo.Travel.entity.Order;
import com.travollo.Travel.repo.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepo orderRepo;

    public ResponseEntity<Object> getOrderById(String id) {
        Optional<Order> foundOrder = orderRepo.findById(id);
        System.out.println("Found order " + foundOrder.toString());

        return foundOrder.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
