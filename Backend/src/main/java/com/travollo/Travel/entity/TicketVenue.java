package com.travollo.Travel.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.sql.Time;
import java.util.List;

@Entity
@Table(name = "ticket_venues")
@Data
@EqualsAndHashCode(callSuper=false)
public class TicketVenue extends TService {
    private Time startTime; // HH:MM:SS
    private Time endTime; // HH:MM:SS

    @OneToMany(mappedBy = "ticketVenue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> ticketList;
}
