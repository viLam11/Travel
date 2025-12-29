package com.travollo.Travel.service.interfac;

import java.util.Map;

public interface MomoServiceInterface {
    Map<String, Object> createPayment(String orderId, Long amount) throws Exception;
    Map<String, Object> transactionStatus(String orderId, String requestId) throws Exception;
}