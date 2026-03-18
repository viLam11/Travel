package com.travollo.Travel.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travollo.Travel.config.MomoConfig;
import com.travollo.Travel.domains.orders.dto.PaymentMomoResponse;
import com.travollo.Travel.service.interfac.MomoServiceInterface;
import com.travollo.Travel.utils.MomoEncoderUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class MomoServiceImp implements MomoServiceInterface {

    @Autowired
    MomoConfig momoConfig;

    @Override
    public PaymentMomoResponse createPayment(String orderId, Long amount) throws Exception {
        JSONObject json = new JSONObject();
        String partnerCode = momoConfig.PARTNER_CODE;
        String accessKey = momoConfig.ACCESS_KEY;
        String secretKey = momoConfig.SECRET_KEY;
        String returnUrl = momoConfig.REDIRECT_URL;
        String notifyUrl = momoConfig.NOTIFY_URL;
        String requestId = orderId + "-" + System.currentTimeMillis();
        String orderInfo = "Thanh toan don hang " + orderId;

        json.put("partnerCode", partnerCode);
        json.put("accessKey", accessKey);
        json.put("requestId", requestId);
        json.put("amount", amount.toString());
        json.put("orderId", orderId);
        json.put("orderInfo", orderInfo);
        json.put("returnUrl", returnUrl);
        json.put("notifyUrl", notifyUrl);
        json.put("requestType", "captureMoMoWallet");
        json.put("extraData", "");

        String data = "partnerCode=" + partnerCode
                + "&accessKey=" + accessKey
                + "&requestId=" + requestId
                + "&amount=" + amount.toString()
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&returnUrl=" + returnUrl
                + "&notifyUrl=" + notifyUrl
                + "&extraData=";
        String hashData = MomoEncoderUtils.signHmacSHA256(data, secretKey);
        json.put("signature", hashData);

        return sendMomoRequest(json, momoConfig.CREATE_ORDER_URL, PaymentMomoResponse.class);
    }

    @Override
    public PaymentMomoResponse transactionStatus(String orderId, String requestId) throws Exception {
        JSONObject json = new JSONObject();
        String partnerCode = momoConfig.PARTNER_CODE;
        String accessKey = momoConfig.ACCESS_KEY;
        String secretKey = momoConfig.SECRET_KEY;

        json.put("partnerCode", partnerCode);
        json.put("accessKey", accessKey);
        json.put("requestId", requestId);
        json.put("orderId", orderId);
        json.put("requestType", "transactionStatus");

        String data = "partnerCode=" + partnerCode
                + "&accessKey=" + accessKey
                + "&requestId=" + requestId
                + "&orderId=" + orderId
                + "&requestType=transactionStatus";

        String hashData = MomoEncoderUtils.signHmacSHA256(data, secretKey);
        json.put("signature", hashData);

        return sendMomoRequest(json, momoConfig.CREATE_ORDER_URL, PaymentMomoResponse.class);
    }

//    private Map<String, Object> sendMomoRequest(JSONObject json, String url) throws Exception {
//        CloseableHttpClient client = HttpClients.createDefault();
//        HttpPost post = new HttpPost(url);
//        StringEntity stringEntity = new StringEntity(json.toString());
//        post.setHeader("content-type", "application/json");
//        post.setEntity(stringEntity);
//
//        CloseableHttpResponse res = client.execute(post);
//        BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
//        StringBuilder resultJsonStr = new StringBuilder();
//        String line;
//        while ((line = rd.readLine()) != null) {
//            resultJsonStr.append(line);
//        }
//
//        ObjectMapper mapper = new ObjectMapper();
//        Map<String, Object> map = mapper.readValue(resultJsonStr.toString(), Map.class);
//
//        return map;
//    }

    private <T> T sendMomoRequest(JSONObject json, String url, Class<T> responseType) throws Exception {
        // Sử dụng try-with-resources để tự động đóng kết nối client/stream, chống tràn RAM
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(url);
            // Set UTF-8 để không bị lỗi font tiếng Việt nếu có
            StringEntity stringEntity = new StringEntity(json.toString(), StandardCharsets.UTF_8);
            post.setHeader("content-type", "application/json");
            post.setEntity(stringEntity);

            try (CloseableHttpResponse res = client.execute(post);
                 BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent(), StandardCharsets.UTF_8))) {

                StringBuilder resultJsonStr = new StringBuilder();
                String line;
                while ((line = rd.readLine()) != null) {
                    resultJsonStr.append(line);
                }

                // ObjectMapper tự động chuyển chuỗi JSON thành Object DTO bạn truyền vào
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readValue(resultJsonStr.toString(), responseType);
            }
        }
    }
}