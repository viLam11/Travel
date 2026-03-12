package com.travollo.Travel.domains.travel.service;

import com.travollo.Travel.entity.TicketVenue;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ServiceRepo;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TicketService {
    private final ServiceRepo serviceRepo;
    

    public ResponseEntity<Object> getTicketsByServiceId(String serviceID) {
        try {
            TicketVenue ticketVenue = (TicketVenue) serviceRepo.findById(serviceID)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket venue not found"));

            return ResponseEntity.ok(ticketVenue.getTicketList());
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving top-rated services");
        }
    }
}
