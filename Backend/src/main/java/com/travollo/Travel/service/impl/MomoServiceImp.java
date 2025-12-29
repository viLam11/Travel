package com.travollo.Travel.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper; // Import thư viện Jackson
import com.travollo.Travel.config.MomoConfig;
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
import java.util.HashMap;
import java.util.Map;

@Service
public class MomoServiceImp implements MomoServiceInterface {

    @Autowired
    MomoConfig momoConfig;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount) throws Exception {
        JSONObject json = new JSONObject();
        String partnerCode = momoConfig.PARTNER_CODE;
        String accessKey = momoConfig.ACCESS_KEY;
        String secretKey = momoConfig.SECRET_KEY;
        String returnUrl = momoConfig.REDIRECT_URL;
        String notifyUrl = momoConfig.NOTIFY_URL;
        String requestId = String.valueOf(System.currentTimeMillis());
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

        // Chuỗi data signature chuẩn
        // SỬA LẠI ĐÚNG THỨ TỰ VÀ TÊN TRƯỜNG NHƯ LOG BÁO LỖI
        String data = "partnerCode=" + partnerCode
                + "&accessKey=" + accessKey
                + "&requestId=" + requestId
                + "&amount=" + amount.toString()
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&returnUrl=" + returnUrl
                + "&notifyUrl=" + notifyUrl
                + "&extraData="; // Lưu ý: extraData rỗng thì không cộng gì thêm sau dấu bằng

        String hashData = MomoEncoderUtils.signHmacSHA256(data, secretKey);
        json.put("signature", hashData);

        return sendMomoRequest(json, momoConfig.CREATE_ORDER_URL);
    }

    @Override
    public Map<String, Object> transactionStatus(String orderId, String requestId) throws Exception {
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

        return sendMomoRequest(json, momoConfig.CREATE_ORDER_URL);
    }

    // --- ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG ---
    private Map<String, Object> sendMomoRequest(JSONObject json, String url) throws Exception {
        CloseableHttpClient client = HttpClients.createDefault();
        HttpPost post = new HttpPost(url);
        StringEntity stringEntity = new StringEntity(json.toString());
        post.setHeader("content-type", "application/json");
        post.setEntity(stringEntity);

        CloseableHttpResponse res = client.execute(post);
        BufferedReader rd = new BufferedReader(new InputStreamReader(res.getEntity().getContent()));
        StringBuilder resultJsonStr = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            resultJsonStr.append(line);
        }

        // CÁCH CŨ GÂY LỖI: Dùng org.json.JSONObject để parse -> trả về JSONArray -> Jackson không hiểu
        /*
        JSONObject result = new JSONObject(resultJsonStr.toString());
        Map<String, Object> map = new HashMap<>();
        Iterator<String> keys = result.keys();
        while(keys.hasNext()) {
            String key = keys.next();
            map.put(key, result.get(key)); // <--- LỖI TẠI ĐÂY NẾU VALUE LÀ JSON ARRAY
        }
        return map;
        */

        // CÁCH MỚI (FIX): Dùng Jackson ObjectMapper parse thẳng String ra Map chuẩn Java
        ObjectMapper mapper = new ObjectMapper();
        // Jackson sẽ tự động chuyển Array thành List, Object thành Map -> An toàn tuyệt đối
        Map<String, Object> map = mapper.readValue(resultJsonStr.toString(), Map.class);

        return map;
    }
}