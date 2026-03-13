package com.travollo.Travel.domains.ticket.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class TicketCreateRequest {
    private String name;
    private String term;
    private BigDecimal price;
}
