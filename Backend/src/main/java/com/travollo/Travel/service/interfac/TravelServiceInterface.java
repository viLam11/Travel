package com.travollo.Travel.service.interfac;

import com.travollo.Travel.entity.TService;
import com.travollo.Travel.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.util.List;

public interface TravelServiceInterface {
    ResponseEntity<Object> getAllServices();
    ResponseEntity<Object> getServiceById(Long serviceID);
    ResponseEntity<Object> getServices(int page, int size, String sortBy, String direction);
    ResponseEntity<Object> createService(MultipartFile photo, String serviceName, String description, String provinceCode,
                                         String address, String contactNumber, Long averagePrice,
                                         String tags, String serviceType, User provider, List<MultipartFile> photos,
                                         Time start_time, Time end_time, Time open_time, Time close_time, String working_days
                                         );
    ResponseEntity<Object> updateService(Long serviceID, TService updatedTService);
    ResponseEntity<Object> deleteService(Long serviceID);
<<<<<<< HEAD
    ResponseEntity<Object> searchServices(String keyword, String serviceType, Long minPrice, Long maxPrice, Double minRating, int page, int size, String sortBy, String direction);
=======
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
}
