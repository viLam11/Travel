package com.travollo.Travel.dto;

import lombok.Data;

@Data
public class VerifyResetOTPRequest {
    private String email;
    private String otp;
}
