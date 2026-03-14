package com.travollo.Travel.service.interfac;

import com.travollo.Travel.domains.travel.dto.ServiceSearchRequest;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.domains.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.util.List;

public interface TravelServiceInterface {
    ResponseEntity<Object> getAllServices();
    ResponseEntity<Object> getServiceById(String serviceID);
    ResponseEntity<Object> getServices(int page, int size, String sortBy, String direction);
    ResponseEntity<Object> createService(MultipartFile photo, String serviceName, String description, String provinceCode,
                                         String address, String contactNumber, Long averagePrice,
                                         String tags, String serviceType, User provider, List<MultipartFile> photos,
                                         Time start_time, Time end_time, Time open_time, Time close_time, String working_days
                                         );
    ResponseEntity<Object> updateService(String serviceID, TService updatedTService);
    ResponseEntity<Object> deleteService(String serviceID);
    ResponseEntity<Object> searchServices(ServiceSearchRequest searchRequest);

//    ResponseEntity<TicketResponse> createTickets(String serviceID, TicketCreateRequest ticketCreateRequest);
//    ResponseEntity<List<TicketResponse>> getTicketsByServiceID(String serviceID);
//    ResponseEntity<TicketResponse> getTicketById(String ticketID);
//    ResponseEntity<TicketResponse> updateTicket(String ticketID, TicketCreateRequest ticketCreateRequest);
//    ResponseEntity<Object> deleteTicket(String ticketID);
}
