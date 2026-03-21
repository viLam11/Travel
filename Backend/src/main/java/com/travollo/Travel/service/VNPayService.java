package com.travollo.Travel.service;

import com.travollo.Travel.domains.orders.entity.TransactionVnpay;
import com.travollo.Travel.domains.orders.service.TransactionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    @Value("${vnp.pay_url}")
    private String vnp_PayUrl;
    @Value("${vnp.return_url}")
    private String vnp_ReturnUrl;
    @Value("${vnp.tmn_code}")
    private String vnp_TmnCode;
    @Value("${vnp.hash_secret}")
    private String secretKey;

    private final TransactionRepo transactionRepo;
}