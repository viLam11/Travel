package com.travollo.Travel.repo;

import com.travollo.Travel.entity.TicketVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketVenueRepo extends JpaRepository<TicketVenue, Long> {
}
