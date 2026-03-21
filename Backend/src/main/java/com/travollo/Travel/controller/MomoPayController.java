package com.travollo.Travel.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import com.travollo.Travel.config.MomoConfig;
import com.travollo.Travel.domains.orders.dto.PaymentMomoResponse;
import com.travollo.Travel.domains.orders.entity.OrderStatus;
import com.travollo.Travel.dto.momo.MomoCallbackDTO;
import com.travollo.Travel.domains.orders.service.OrderService;
import com.travollo.Travel.utils.MomoEncoderUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping(value = "/api/momo")
public class MomoPayController {

    @Autowired
    MomoConfig momoConfig;

    @Autowired
    private OrderService orderService;

    @GetMapping(value = "/test")
    public String test() {
        return "Test";
    }

}