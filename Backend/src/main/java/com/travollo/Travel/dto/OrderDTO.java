package com.travollo.Travel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.joda.time.DateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO {
    private Long orderID;
    private DateTime orderDate;
    private String status;
    private Double totalAmount;
    private String guestPhone;
    private String note;

    private UserDTO user;
    private ServiceDTO service;
}
