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

    @GetMapping(value = "/result")
    public Map<String, String> completePayment(HttpServletRequest request,
                                               @RequestParam(name = "vnp_OrderInfo") String vnp_OrderInfo,
                                               @RequestParam(name = "vnp_Amount") Integer vnp_Amount,
                                               @RequestParam(name = "vnp_BankCode", defaultValue = "") String vnp_BankCode,
                                               @RequestParam(name = "vnp_BankTranNo") String vnp_BankTranNo,
                                               @RequestParam(name = "vnp_CardType") String vnp_CardType,
                                               @RequestParam(name = "vnp_PayDate") String vnp_PayDate,
                                               @RequestParam(name = "vnp_ResponseCode") String vnp_ResponseCode,
                                               @RequestParam(name = "vnp_TransactionNo") String vnp_TransactionNo,
                                               @RequestParam(name = "vnp_TxnRef") String vnp_TxnRef
    ) {
        Map<String, String> response = new HashMap<>();

        String year = vnp_PayDate.substring(0, 4);
        String month = vnp_PayDate.substring(4, 6);
        String date = vnp_PayDate.substring(6, 8);
        String hour = vnp_PayDate.substring(8, 10);
        String minutes = vnp_PayDate.substring(10, 12);
        String second = vnp_PayDate.substring(12, 14);

        String timePay = date + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + second;

        response.put("vnp_OrderInfo", vnp_OrderInfo);
        response.put("vnp_Amount", vnp_Amount.toString());
        response.put("vnp_BankCode", vnp_BankCode);
        response.put("vnp_BankTranNo", vnp_BankTranNo);
        response.put("vnp_CardType", vnp_CardType);
        response.put("vnp_PayDate", timePay);
        response.put("vnp_ResponseCode", vnp_ResponseCode);
        response.put("vnp_TransactionNo", vnp_TransactionNo);
        response.put("vnp_TxnRef", vnp_TxnRef);

        return response;
    }
}