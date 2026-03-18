package com.travollo.Travel.domains.ticket.repo;

import com.travollo.Travel.domains.ticket.entity.TicketVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketVenueRepo extends JpaRepository<TicketVenue, String> {
}
