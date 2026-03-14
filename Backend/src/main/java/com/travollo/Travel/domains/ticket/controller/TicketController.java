package com.travollo.Travel.domains.ticket.controller;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.ticket.dto.TicketCreateRequest;
import com.travollo.Travel.domains.ticket.dto.TicketResponse;
import com.travollo.Travel.domains.ticket.service.TicketService;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping("")
    public ResponseEntity<PageResponse<TicketResponse>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets(0, 10));
    }

    @GetMapping("/{ticketID}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String ticketID)
    {
        return ResponseEntity.ok(ticketService.getTicketById(ticketID));
    }

    @PatchMapping("/{ticketID}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable String ticketID,
            @RequestBody TicketCreateRequest updateRequest,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(ticketService.updateTicket(ticketID, updateRequest, currentUser));
    }

    @DeleteMapping("/{ticketID}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String ticketID,
            @CurrentUser User currentUser
    ) {
        ticketService.deleteTicket(ticketID, currentUser);
        return ResponseEntity.noContent().build();
    }

}
