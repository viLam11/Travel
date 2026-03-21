package com.travollo.Travel.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.travollo.Travel.config.VnpayConfig;
import com.travollo.Travel.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping(value = "/api/vnpay")
public class VnpayPayController {
    @Autowired
    VnpayConfig vnpayConfig;

    @Autowired
    private VNPayService vnPayService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam int amount,
                                           @RequestParam String orderID,
                                           @RequestParam(required = false) String bankCode) {
        try {
            // Lấy IP người dùng
            String ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }

            String paymentUrl = vnPayService.createPaymentUrl(amount, orderID, bankCode, ipAddress);

            Map<String, String> result = new HashMap<>();
            result.put("code", "00");
            result.put("message", "success");
            result.put("data", paymentUrl);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


}