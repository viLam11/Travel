package com.travollo.Travel.domains.travel.dto;

import com.travollo.Travel.entity.TicketVenue;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class TicketCreateRequest {
    private String id;
    private String name;
    private String term;
    private BigDecimal price;
    private Timestamp validFrom;
    private Timestamp validTo;
}
