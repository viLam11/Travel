package com.travollo.Travel.service.interfac;

import com.travollo.Travel.domains.orders.dto.PaymentMomoResponse;

import java.util.Map;

public interface MomoServiceInterface {
    PaymentMomoResponse createPayment(String orderId, Long amount) throws Exception;
    PaymentMomoResponse transactionStatus(String orderId, String requestId) throws Exception;
}