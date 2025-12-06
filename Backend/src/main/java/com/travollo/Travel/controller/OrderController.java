package com.travollo.Travel.controller;

import com.travollo.Travel.service.impl.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
//@PreAuthorize("hasRole('ADMIN')")
public class OrderController {

    @Autowired
    private OrderService orderService;

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
}
