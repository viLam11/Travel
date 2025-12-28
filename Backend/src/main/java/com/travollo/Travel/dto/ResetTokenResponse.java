package com.travollo.Travel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetTokenResponse {
    private int statusCode;
    private String message;
    private String resetToken;
}
