package com.travollo.Travel.service.interfac;

import com.travollo.Travel.entity.TService;
import org.springframework.http.ResponseEntity;

public interface TravelServiceInterface {
    ResponseEntity<Object> getAllServices();
    ResponseEntity<Object> getServiceById(Long serviceID);
    ResponseEntity<Object> createService(TService newTService);
    ResponseEntity<Object> updateService(Long serviceID, TService updatedTService);
    ResponseEntity<Object> deleteService(Long serviceID);
}
