package com.travollo.Travel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class SuccessResponse {
    String message;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp;


    public SuccessResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
