package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Ticket;
import com.travollo.Travel.entity.TicketVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepo extends JpaRepository<Ticket, Long> {
    List<Ticket> findByTicketVenue(TicketVenue ticket);
}
