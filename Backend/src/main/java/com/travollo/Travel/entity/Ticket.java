package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String term;
    private double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_venue_id")
    private TicketVenue ticketVenue;
}
