package com.travollo.Travel.service.impl;

import com.travollo.Travel.entity.TService;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ServiceRepo;
import com.travollo.Travel.service.interfac.TravelServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class TravelService implements TravelServiceInterface {
    @Autowired
    private ServiceRepo serviceRepo;

    public ResponseEntity<Object> getAllServices(){
        try {
            List<TService> TServices = serviceRepo.findAll();
            return ResponseEntity.ok(TServices);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving services");
        }
    };
    public ResponseEntity<Object> getServiceById(Long serviceID){
        try {
            Optional<TService> optionalTService = serviceRepo.findById(serviceID);
            return optionalTService.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving the service");
        }
    };
    public ResponseEntity<Object> createService(TService newTService){
        try {
            TService savedTService = serviceRepo.save(newTService);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTService);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while creating the service");
        }
    };
    public ResponseEntity<Object> updateService(Long serviceID, TService updatedTService){
        try {
            Optional<TService> optionalTService = serviceRepo.findById(serviceID);
            if (optionalTService.isPresent()) {
                TService existingTService = optionalTService.get();
                // Update fields
                existingTService.setServiceName(updatedTService.getServiceName());
                existingTService.setDescription(updatedTService.getDescription());
                existingTService.setProvince(updatedTService.getProvince());
                existingTService.setAddress(updatedTService.getAddress());
                existingTService.setContactNumber(updatedTService.getContactNumber());
                existingTService.setRating(updatedTService.getRating());
                existingTService.setTags(updatedTService.getTags());
                existingTService.setAveragePrice(updatedTService.getAveragePrice());
                existingTService.setServiceType(updatedTService.getServiceType());
                existingTService.setProvider(updatedTService.getProvider());
                existingTService.setImageList(updatedTService.getImageList());

                TService savedTService = serviceRepo.save(existingTService);
                return ResponseEntity.ok(savedTService);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while updating the service");
        }
    };
    public ResponseEntity<Object> deleteService(Long serviceID){
        try {
            if (serviceRepo.existsById(serviceID)) {
                serviceRepo.deleteById(serviceID);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while deleting the service");
        }
    };
}
