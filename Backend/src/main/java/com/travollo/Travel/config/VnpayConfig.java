package com.travollo.Travel.config;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;

@Component
public class VnpayConfig {

    @Value("${vnp.pay_url}")
    public String vnp_PayUrl;
    @Value("${vnp.return_url}")
    public String vnp_Returnurl;
    @Value("${vnp.tmn_code}")
    public String vnp_TmnCode;
    @Value("${vnp.hash_secret}")
    public String vnp_HashSecret;
    @Value("${vnp.api_url}")
    public String vnp_apiUrl;

    public static String Sha256(String message) {
        String digest = null;

        return digest;
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}