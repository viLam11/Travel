package com.travollo.Travel.controller;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.dto.services.ServiceCreateRequest;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.impl.CommentSService;
import com.travollo.Travel.service.impl.TravelService;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private TravelService travelService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CommentSService commentSService;

    @Autowired
    private Utils utils;

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

    @GetMapping("/search")
    public ResponseEntity<Object> searchServices(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "serviceType", required = false) String serviceType,
            @RequestParam(value = "minPrice", required = false) Long minPrice,
            @RequestParam(value = "maxPrice", required = false) Long maxPrice,
            @RequestParam(value = "minRating", required = false) Double minRating,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", defaultValue = "asc") String direction
    ) {
        return travelService.searchServices(keyword, serviceType, minPrice, maxPrice, minRating, page, size, sortBy, direction);
    }

    @GetMapping("/{serviceID}")
    ResponseEntity<Object> getServiceById(@PathVariable Long serviceID) {
        return travelService.getServiceById(serviceID);
    }


    @PostMapping(value = "/newService", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Object> createNewService(
            @RequestParam("thumbnail") MultipartFile thumbnail,
            @RequestParam("serviceName") String serviceName,
            @RequestParam("description") String description,
            @RequestParam(value = "provinceCode") String provinceCode,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "contactNumber", required = false) String contactNumber,
            @RequestParam(value = "averagePrice", required = false) Long averagePrice,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "serviceType") String serviceType,
            @RequestParam(value = "photo", required = false) List<MultipartFile> photos,
            // TICKET_VENUE
            @RequestParam(value = "start_time", required = false) Time start_time,
            @RequestParam(value = "end_time", required = false) Time end_time,
            // RESTAURANT
            @RequestParam(value = "open_time", required = false) Time open_time,
            @RequestParam(value = "close_time", required = false) Time close_time,
            @RequestParam(value = "working_days", required = false) String working_days,

            HttpServletRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user_email = authentication.getName();
        System.out.println("User gửi request này là: " + user_email);
        Optional<User> provider = userRepo.findByEmail(user_email);
        if (provider.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        } else {
            if (provider.get().getRole() != Role.PROVIDER) {
                return ResponseEntity.status(403).body("User is not a provider");
            }
        }
        return travelService.createService(thumbnail, serviceName, description, provinceCode,
                address, contactNumber, averagePrice, tags, serviceType,
                provider.get(), photos, start_time, end_time, open_time, close_time, working_days);
    }


    @PatchMapping("/upload/img/{id}")
    ResponseEntity<Object> uploadImages(
            @PathVariable Long id,
            @RequestBody List<MultipartFile> photos
    ) {
        return travelService.uploadImages(id, photos);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Object> deleteService(@PathVariable Long id) {
        System.out.println("Received request to delete service with ID: " + id);
        return travelService.deleteService(id);
    }

//    @PostMapping(
//            value = "/comment/{serviceID}",
//            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
//    )
//    ResponseEntity<Object> commentService(
//            @PathVariable Long serviceID,
//            @ModelAttribute CreateCommentDTO comment,
//            HttpServletRequest request
//    ) {
//        Optional<User> user = utils.findUserByRequest(request);
//        if (user.isEmpty()) {
//            return ResponseEntity.status(404).body("User not found");
//        }
//        return commentSService.addComment(comment, user.get());
//    }
}
