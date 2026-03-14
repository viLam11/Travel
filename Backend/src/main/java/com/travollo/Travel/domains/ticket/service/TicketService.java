package com.travollo.Travel.domains.ticket.service;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.ticket.dto.TicketCreateRequest;
import com.travollo.Travel.domains.ticket.dto.TicketResponse;
import com.travollo.Travel.domains.ticket.repo.TicketRepo;
import com.travollo.Travel.entity.Ticket;
import com.travollo.Travel.entity.TicketVenue;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ServiceRepo;
import com.travollo.Travel.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final ServiceRepo serviceRepo;
    private final TicketRepo ticketRepo;
    private final TicketMapper ticketMapper;

    /** Retrieve tickets with pagination
     * @param pageNo   The page number to retrieve (0-based index)
     * @param pageSize The number of items per page
     * @return A PageResponse containing the list of TicketResponse and pagination metadata
     * */
    public PageResponse<TicketResponse> getAllTickets(int pageNo, int pageSize) {
        Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNo);
        Page<TicketResponse> ticketPage = ticketRepo.findAll(pageable).map(this::mapToTicketResponse);

        return new PageResponse<>(
                ticketPage.getContent(),
                ticketPage.getNumber(),
                ticketPage.getSize(),
                ticketPage.getTotalElements(),
                ticketPage.getTotalPages(),
                ticketPage.isLast()
        );
    }

    /** Create a new ticket for a specific service
     * @param serviceID The ID of the service (ticket venue) to which the ticket belongs
     * @param ticketCreateRequest The request object containing ticket details (name, term, price
     * @return The created TicketResponse object
     * */
    public TicketResponse createTicket(
            String serviceID,
            TicketCreateRequest ticketCreateRequest
    ) {
        TicketVenue ticketVenue = (TicketVenue) serviceRepo.findById(serviceID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket venue not found"));

        Ticket newTicket = Ticket.builder()
                .name(ticketCreateRequest.getName())
                .term(ticketCreateRequest.getTerm())
                .price(ticketCreateRequest.getPrice())
                .ticketVenue(ticketVenue)
                .build();
        Ticket savedTicket = ticketRepo.save(newTicket);

        return mapToTicketResponse(savedTicket);
    }

    /** Retrieve a ticket by id
     * @param ticketID The ID of the ticket to retrieve
     * @return The TicketResponse object corresponding to the retrieved ticket
     * */
    public TicketResponse getTicketById(String ticketID) {
        Ticket ticket = ticketRepo.findById(ticketID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket not found"));
        return mapToTicketResponse(ticket);
    }

    /** Retrieve all tickets associated with a specific service (ticket venue)
     * @param serviceID The ID of the service (ticket venue) for which to retrieve
     * @return A list of TicketResponse objects corresponding to the tickets associated with the specified service
     * */
    public List<TicketResponse> getTicketsByServiceId(String serviceID) {
        TicketVenue ticketVenue = (TicketVenue) serviceRepo.findById(serviceID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket venue not found"));

        return ticketRepo.findByTicketVenue(ticketVenue).stream()
                .map(this::mapToTicketResponse)
                .toList();
    }

    /** Delete a ticket by id with permission check
     * @param ticketID The ID of the ticket to delete
     * @param currentUser The currently authenticated user attempting to delete the ticket
     * @throws CustomException if the ticket is not found or if the user does not have permission to delete the ticket
     * */
    public void deleteTicket(String ticketID, User currentUser) {
        Ticket ticket = ticketRepo.findById(ticketID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket not found"));

        // Validate permission
        if ( currentUser.getRole() != Role.ADMIN
                && !currentUser.getUserID().equals(ticket.getTicketVenue().getProvider().getUserID())
        ) {
            throw new CustomException(HttpStatus.FORBIDDEN, "You do not have permission to delete this ticket");
        }

        ticketRepo.delete(ticket);
    }

    /** Update ticket details with permission check
     * @param ticketID The ID of the ticket to update
     * @param updateRequest The request object containing the updated ticket details (name, term, price)
     * @param currentUser The currently authenticated user attempting to update the ticket
     * @return The updated TicketResponse object
     * @throws CustomException if the ticket is not found or if the user does not have permission to update the ticket
     * */
    public TicketResponse updateTicket(String ticketID, TicketCreateRequest updateRequest, User currentUser) {
        Ticket existingTicket = ticketRepo.findById(ticketID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket not found"));
        if (currentUser.getRole() != Role.ADMIN &&
            currentUser.getUserID().equals(existingTicket.getTicketVenue().getProvider().getUserID())
        ) {
            throw new CustomException(HttpStatus.FORBIDDEN, "You do not have permission to update this ticket");
        }

        ticketMapper.patchRequest(updateRequest, existingTicket);
        Ticket updatedTicket = ticketRepo.save(existingTicket);
        return mapToTicketResponse(updatedTicket);
    }

    /** Map Ticket Entity -> TicketResponse DTO
     * @param ticket The Ticket entity to be mapped
     * @return The TicketResponse DTO corresponding to the provided Ticket entity
     */
    private TicketResponse mapToTicketResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setName(ticket.getName());
        response.setTerm(ticket.getTerm());
        response.setPrice(ticket.getPrice());
        response.setServiceID(ticket.getTicketVenue().getId());
        response.setServiceName(ticket.getTicketVenue().getServiceName());
        return response;
    }
}
