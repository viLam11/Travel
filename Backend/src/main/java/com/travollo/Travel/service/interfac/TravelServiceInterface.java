package com.travollo.Travel.service.interfac;

import com.travollo.Travel.entity.TService;
import com.travollo.Travel.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TravelServiceInterface {
    ResponseEntity<Object> getAllServices();
    ResponseEntity<Object> getServiceById(Long serviceID);
    ResponseEntity<Object> getServices(int page, int size, String sortBy, String direction);
    ResponseEntity<Object> createService(MultipartFile photo, String serviceName, String description, String provinceCode,
                                         String address, String contactNumber, Long averagePrice,
                                         String tags, String serviceType, User provider, List<MultipartFile> photos);
    ResponseEntity<Object> updateService(Long serviceID, TService updatedTService);
    ResponseEntity<Object> deleteService(Long serviceID);
}
