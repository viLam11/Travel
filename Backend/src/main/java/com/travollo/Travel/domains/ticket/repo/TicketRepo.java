package com.travollo.Travel.domains.ticket.repo;

import com.travollo.Travel.domains.ticket.entity.Ticket;
import com.travollo.Travel.domains.ticket.entity.TicketVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepo extends JpaRepository<Ticket, String> {
    List<Ticket> findByTicketVenue(TicketVenue ticket);
}
