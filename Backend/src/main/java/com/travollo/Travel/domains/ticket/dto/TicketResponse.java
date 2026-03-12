package com.travollo.Travel.domains.ticket.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TicketResponse {
    private String id;
    private String name;
    private String term;
    private BigDecimal price;

    private String serviceID;
    private String serviceName;

}
