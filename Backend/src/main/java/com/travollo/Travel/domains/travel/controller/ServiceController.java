package com.travollo.Travel.domains.travel.controller;

import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.domains.hotel.dto.RoomResponseDTO;
import com.travollo.Travel.domains.hotel.service.HotelAndRoomService;
import com.travollo.Travel.domains.ticket.dto.TicketCreateRequest;
import com.travollo.Travel.domains.ticket.service.TicketService;
import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.domains.travel.dto.ServiceFilterDTO;
import com.travollo.Travel.domains.travel.dto.ServiceSearchRequest;
import com.travollo.Travel.domains.ticket.dto.TicketResponse;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.domains.comments.service.CommentSService;
import com.travollo.Travel.domains.travel.service.TravelService;
import com.travollo.Travel.utils.CurrentUser;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    ResponseEntity<List<TService>> getAllServices() {
        return ResponseEntity.status(HttpStatus.OK).body(travelService.getAllServices());
    }

//    @GetMapping("/data")
//    ResponseEntity<Object> getServices(
//            @RequestParam(name = "page", defaultValue = "0") int page,
//            @RequestParam(name = "size", defaultValue = "10") int size
//    ) {
//            return travelService.getServices(page, size, "id", "asc");
//    }

    @GetMapping("/{serviceID}")
    ResponseEntity<TService> getServiceById(@PathVariable String serviceID) {
        return ResponseEntity.status(HttpStatus.OK).body(travelService.getServiceById(serviceID));
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
        return ResponseEntity.status(HttpStatus.CREATED).body(travelService.createService(newServiceRequest, currentUser));
    }

    @PatchMapping("/upload/img/{id}")
    ResponseEntity<Object> uploadImages(
            @PathVariable String id,
            @RequestBody List<MultipartFile> photos
    ) {
        return ResponseEntity.status(HttpStatus.OK).body(travelService.uploadImages(id, photos));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<String> deleteService(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.OK).body("Delete successfully");
    }

    @GetMapping("/{id}/tickets")
    ResponseEntity<List<TicketResponse>> getTicketsByServiceId(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketsByServiceId(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TService>> searchServicesInProvince(
            @ModelAttribute ServiceSearchRequest searchRequest
            ) {
        return ResponseEntity.status(HttpStatus.OK).body(travelService.searchServices(searchRequest));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<TService>> filterServices(
            @ModelAttribute ServiceFilterDTO filterDTO
            ) {
        return ResponseEntity.status(HttpStatus.OK).body(travelService.filterServices(filterDTO));
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
