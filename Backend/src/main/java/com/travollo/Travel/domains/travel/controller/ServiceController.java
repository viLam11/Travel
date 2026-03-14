package com.travollo.Travel.domains.travel.controller;

import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.domains.hotel.dto.RoomResponseDTO;
import com.travollo.Travel.domains.hotel.service.HotelAndRoomService;
import com.travollo.Travel.domains.ticket.dto.TicketCreateRequest;
import com.travollo.Travel.domains.ticket.service.TicketService;
import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.domains.travel.dto.ServiceSearchRequest;
import com.travollo.Travel.domains.ticket.dto.TicketResponse;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.domains.comments.service.CommentSService;
import com.travollo.Travel.domains.travel.service.TravelService;
import com.travollo.Travel.utils.CurrentUser;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final TravelService travelService;
    private final UserRepo userRepo;
    private final CommentSService commentSService;
    private final Utils utils;
    private final TicketService ticketService;
    private final HotelAndRoomService hotelAndRoomService;

    @GetMapping("/all")
    ResponseEntity<Object> getAllServices() {
        return travelService.getAllServices();
    }

    @GetMapping("/data")
    ResponseEntity<Object> getServices(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        try {
            return travelService.getServices(page, size, "id", "asc");
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving services with pagination");
        }
    }

    @GetMapping("/{serviceID}")
    ResponseEntity<Object> getServiceById(@PathVariable String serviceID) {
        return travelService.getServiceById(serviceID);
    }

    @PostMapping(value = "/newService")
    ResponseEntity<Object> createNewService(
            @ModelAttribute NewServiceRequest newServiceRequest,
            @CurrentUser User currentUser
    ) {
        if (currentUser  == null) {
            return ResponseEntity.status(404).body("User not found");
        } else {
            if (currentUser.getRole() != Role.PROVIDER_HOTEL && currentUser.getRole() != Role.PROVIDER_VENUE) {
                return ResponseEntity.status(403).body("User is not a provider");
            }
        }
        return travelService.createService(newServiceRequest, currentUser);
    }

    @PatchMapping("/upload/img/{id}")
    ResponseEntity<Object> uploadImages(
            @PathVariable String id,
            @RequestBody List<MultipartFile> photos
    ) {
        return travelService.uploadImages(id, photos);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Object> deleteService(@PathVariable String id) {
        System.out.println("Received request to delete service with ID: " + id);
        return travelService.deleteService(id);
    }

    @GetMapping("/{id}/tickets")
    ResponseEntity<List<TicketResponse>> getTicketsByServiceId(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketsByServiceId(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchServicesInProvince(
            @ModelAttribute ServiceSearchRequest searchRequest
            ) {
        return travelService.searchServices(searchRequest);
    }

    @PostMapping("/{ticketVenueID}/tickets")
    ResponseEntity<TicketResponse> createTicket(
            @PathVariable String ticketVenueID,
            @RequestBody TicketCreateRequest ticketCreateRequest
    ) {
        return ResponseEntity.ok(ticketService.createTicket(ticketVenueID, ticketCreateRequest));
    }

    @GetMapping("{hotelID}/rooms")
    ResponseEntity<List<RoomResponseDTO>> getAllRoomsByHotel(
            @PathVariable String hotelID) {
        return ResponseEntity.ok(hotelAndRoomService.getAllRoomByHotelID(hotelID));
    }

    @PostMapping("/{hotelID}/rooms")
    ResponseEntity<RoomResponseDTO> createRoom(
            @PathVariable String hotelID,
            @ModelAttribute NewRoomRequest roomCreateRequest
            ) {
        return ResponseEntity.ok(hotelAndRoomService.createRoom(hotelID, roomCreateRequest));
    }

}
