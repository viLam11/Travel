package com.travollo.Travel.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyDTO {
    private String email;
    private String verificationCode;
}