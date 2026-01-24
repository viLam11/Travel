package com.travollo.Travel.dto.momo;

import lombok.Data;
@Data
public class MomoCallbackDTO {
    private String partnerCode;
    private String orderId;
    private String requestId;
    private String amount;
    private String orderInfo;
    private String orderType;
    private String transId;
    private int resultCode; // 0 là thành công
    private String message;
    private String payType;
    private String responseTime;
    private String extraData;
    private String signature;
}