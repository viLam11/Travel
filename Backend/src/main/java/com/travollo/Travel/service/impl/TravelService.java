package com.travollo.Travel.service.impl;

import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ImageServiceRepo;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.repo.ServiceRepo;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.service.interfac.TravelServiceInterface;
import com.travollo.Travel.utils.ServiceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@org.springframework.stereotype.Service
public class TravelService implements TravelServiceInterface {
    @Autowired
    private ServiceRepo serviceRepo;

    @Autowired
    private AwsS3Service awsS3Service;

    @Autowired
    private ProvinceRepo provinceRepo;

    @Autowired
    private ImageServiceRepo imgServiceRepo;

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

    public ResponseEntity<Object> getServices(int page, int size, String sortBy, String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("desc") ?
                    Sort.by(sortBy).descending() :
                    Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<TService> servicesPage;
            servicesPage = serviceRepo.findAll(pageable);
            System.out.println("Services Page: " + servicesPage);
            Map<String, Object> response = new HashMap<>();
            response.put("services", servicesPage.getContent());
            response.put("currentPage", servicesPage.getNumber());
            response.put("totalItems", servicesPage.getTotalElements());
            response.put("totalPages", servicesPage.getTotalPages());
            response.put("pageSize", servicesPage.getSize());
            response.put("sortBy", sortBy);
            response.put("direction", direction);

            System.out.println("Paginated Services Response: " + response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while retrieving paginated services: " + e.getMessage());
        }
    }

    public ResponseEntity<Object> uploadImages(Long id, List<MultipartFile> photos) {
        try {
            List<String> urls = awsS3Service.saveImagesToS3(photos);
            TService service = serviceRepo.findById(id).orElse(null);
            if (service == null) {
                return ResponseEntity.notFound().build();
            }

            List<ImageService> imageEntities = new ArrayList<>();

            for (String url : urls) {
                ImageService img = new ImageService();
                img.setImageUrl(url);
                img.setDescription("Ảnh dịch vụ " + url);
                img.setTService(service);
                imageEntities.add(img);
            }

            imgServiceRepo.saveAll(imageEntities);

            return ResponseEntity.ok().body("HEHE");
        } catch (Exception e){
            throw new CustomException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    public ResponseEntity<Object> createService(MultipartFile thumbnail, String serviceName, String description, String provinceCode,
                                                String address, String contactNumber, Long averagePrice,
                                                String tags, String serviceType, User provider,
                                                List<MultipartFile> photos)
        {
        try {
            TService newTService;
            String thumbnailUrl = null;
            if (thumbnail != null && !thumbnail.isEmpty()) {
                thumbnailUrl = awsS3Service.saveImageToS3(thumbnail);
            }


            Province province = provinceRepo.findById(provinceCode).orElse(null);
            if ("HOTEL".equals(serviceType)) {
                newTService = new Hotel();
            } else if ( "RESTAURANT".equals(serviceType) ) {
                newTService = new Restaurant();
            } else {
                TicketVenue ticketVenue = new TicketVenue();
                ticketVenue.setStartTime(null);
                ticketVenue.setEndTime(null);
                newTService = ticketVenue;
            }
            newTService.setServiceName(serviceName);
            newTService.setDescription(description);
            newTService.setProvince(province);
            newTService.setAddress(address);
            newTService.setContactNumber(contactNumber);
            newTService.setAveragePrice(averagePrice);
            newTService.setTags(tags);
            newTService.setServiceType(ServiceType.valueOf(serviceType));
            newTService.setProvider(provider);
            newTService.setThumbnailUrl(thumbnailUrl);


            System.out.println("New Service: " + newTService);

            TService savedService =  serviceRepo.save(newTService);
            if (photos != null && !photos.isEmpty()) {
                uploadImages(savedService.getId(), photos);
                savedService = serviceRepo.findById(savedService.getId())
                        .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Service not found after saving"));

            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
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
