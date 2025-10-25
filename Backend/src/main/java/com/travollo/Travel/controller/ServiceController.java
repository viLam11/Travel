package com.travollo.Travel.controller;

import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.service.impl.TravelService;
import com.travollo.Travel.utils.Role;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/services")
public class ServiceController {
    @Autowired
    private AwsS3Service awsS3Service;

    @Autowired
    private TravelService travelService;

    @Autowired
    private UserRepo userRepo;

    @GetMapping("/all")
    ResponseEntity<Object> getAllServices(){
        return travelService.getAllServices();
    }

    @GetMapping("/data")
    ResponseEntity<Object> getServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        try {
            int pageIndex = (page > 0) ? page - 1 : 0;
            return travelService.getServices(page, size, "id", "asc");
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving services with pagination");
        }
    }


    @PostMapping("/{serviceID}")
    ResponseEntity<Object> getServiceById(@PathVariable Long serviceID){
        return travelService.getServiceById(serviceID);
    }

    @PostMapping("/newService")
    ResponseEntity<Object> createNewService(
            @RequestParam("thumbnail") MultipartFile thumbnail,
            @RequestParam("serviceName") String serviceName,
            @RequestParam("description") String description,
            @RequestParam(value = "provinceCode", required = false) String provinceCode,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "contactNumber", required = false) String contactNumber,
            @RequestParam(value = "averagePrice", required = false) Long averagePrice,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "serviceType", required = false) String serviceType,
            @RequestParam(value = "photo", required = false) List<MultipartFile> photos,
            HttpServletRequest request
    ){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user_email = authentication.getName();
        System.out.println("User gửi request này là: " + user_email);
        Optional<User> provider = userRepo.findByEmail(user_email);
        if (provider.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        } else {
            if (provider.get().getRole() != Role.PROVIDER ) {
                return ResponseEntity.status(403).body("User is not a provider");
            }
        }
        return travelService.createService(thumbnail, serviceName, description, provinceCode,
                address, contactNumber, averagePrice, tags, serviceType,
                provider.get(), photos);
    }

    @PatchMapping("/upload/img/{id}")
    ResponseEntity<Object> uploadImamges(
            @PathVariable Long id,
            @RequestBody List<MultipartFile> photos
    ) {
        return travelService.uploadImages(id, photos);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Object> deleteService(@PathVariable Long id){
        System.out.println("Received request to delete service with ID: " + id);
        return travelService.deleteService(id);
    }

}
