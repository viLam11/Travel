package com.travollo.Travel.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
//@PreAuthorize("hasRole('ADMIN')")
public class OrderController {
    @GetMapping("/test")
    public  String test(){
        return "ORDER TEST";
    }
}
