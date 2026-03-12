package com.travollo.Travel.domains.travel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class TicketResponse {
    private String id;
    private String name;
    private String term;
    private BigDecimal price;
    private Timestamp validFrom;
    private Timestamp validTo;

    private String serviceID;
    private String serviceName;

}
