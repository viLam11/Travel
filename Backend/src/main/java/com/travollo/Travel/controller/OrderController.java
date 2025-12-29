package com.travollo.Travel.controller;

<<<<<<< HEAD
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
=======
import com.travollo.Travel.service.impl.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
//@PreAuthorize("hasRole('ADMIN')")
public class OrderController {
<<<<<<< HEAD
=======

    @Autowired
    private OrderService orderService;

>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
    @GetMapping("/test")
    public  String test(){
        return "ORDER TEST";
    }
<<<<<<< HEAD
=======

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrderById(
            @PathVariable String id
    ) {
        return orderService.getOrderById(id);
    }
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
}
