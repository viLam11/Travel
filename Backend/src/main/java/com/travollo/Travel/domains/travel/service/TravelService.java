package com.travollo.Travel.service.impl;

import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.*;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.service.interfac.TravelServiceInterface;
import com.travollo.Travel.utils.ServiceType;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.util.*;

@Service
public class TravelService implements TravelServiceInterface {
    @Autowired
    private ServiceRepo serviceRepo;
    @Autowired
    private AwsS3Service awsS3Service;
    @Autowired
    private ProvinceRepo provinceRepo;
    @Autowired
    private ImageServiceRepo imgServiceRepo;
    @Autowired
    private CommentServiceRepo commentRepo;
    @Autowired
    private TicketRepo ticketRepo;
    @Autowired
    private ModelMapper modelMapper;


    public ResponseEntity<Object> getAllServices(){
        try {
            List<TService> TServices = serviceRepo.findAll();
            return ResponseEntity.ok(TServices);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving services");
        }
    }

    public ResponseEntity<Object> getServiceById(String serviceID){
        try {
            Optional<TService> optionalTService = serviceRepo.findById(serviceID);
            if (optionalTService.isPresent()) {
                List<CommentService> commentList = optionalTService.get().getCommentList();
            }
            return optionalTService.<ResponseEntity<Object>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving the service");
        }
    }

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
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while retrieving paginated services: " + e.getMessage());
        }
    }

    public ResponseEntity<Object> uploadImages(String id, List<MultipartFile> photos) {
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

            return ResponseEntity.ok().body("Re-up images");
        } catch (Exception e){
            throw new CustomException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    public ResponseEntity<Object> createService(NewServiceRequest request)
    {
        try {
            TService newTService = modelMapper.map(request, TService.class);
            newTService.setThumbnailUrl(awsS3Service.saveImageToS3(request.getThumbnail()));
            return ResponseEntity.status(HttpStatus.CREATED).body(serviceRepo.save(newTService));
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    };

    public ResponseEntity<Object> createService(MultipartFile thumbnail, String serviceName, String description, String provinceCode,
                                                String address, String contactNumber, Long averagePrice,
                                                String tags, String serviceType, User provider,
                                                List<MultipartFile> photos,
                                                Time start_time, Time end_time, Time open_time, Time close_time, String working_days
    )
    {
        try {
            TService newTService;
            String thumbnailUrl = null;
            if (thumbnail != null && !thumbnail.isEmpty()) {
                thumbnailUrl = awsS3Service.saveImageToS3(thumbnail);
            }
            Province province = provinceRepo.findById(provinceCode).orElse(null);

            if ("HOTEL".equals(serviceType)) {
                Hotel hotel = new Hotel();
                newTService = hotel;
            } else if ( "RESTAURANT".equals(serviceType) ) {
                Restaurant restaurant = new Restaurant();
                restaurant.setOpenTime(open_time);
                restaurant.setCloseTime(close_time);
                restaurant.setWorkingDays(working_days);
                newTService = restaurant;
            } else {
                TicketVenue ticketVenue = new TicketVenue();
                ticketVenue.setStartTime(start_time);
                ticketVenue.setEndTime(end_time);
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

    public ResponseEntity<Object> updateService(String serviceID, TService updatedTService){
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

    public ResponseEntity<Object> deleteService(String serviceID){
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

    public ResponseEntity<Object> searchServices(
            String keyword,
            String serviceType,
            Long minPrice,
            Long maxPrice,
            Long minRating,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        try {
            Sort sort = direction.equalsIgnoreCase("desc") ?
                    Sort.by(sortBy).descending() :
                    Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);

            ServiceType serviceTypeEnum = null;
            if (serviceType != null && !serviceType.trim().isEmpty() && !serviceType.equalsIgnoreCase("ALL")) {
                try {
                    serviceTypeEnum = ServiceType.valueOf(serviceType.toUpperCase());
                } catch (IllegalArgumentException e) {
                    serviceTypeEnum = null;
                }
            }

            String searchKeyword = (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim();
            Long searchMinPrice = (minPrice == null) ? 0L : minPrice;
            Long searchMaxPrice = (maxPrice == null) ? Long.MAX_VALUE : maxPrice;

            Page<TService> servicesPage = serviceRepo.searchServices(
                    keyword,
                    serviceTypeEnum,
                    minPrice,
                    maxPrice,
                    minRating,
                    pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("services", servicesPage.getContent());
            response.put("currentPage", servicesPage.getNumber());
            response.put("totalItems", servicesPage.getTotalElements());
            response.put("totalPages", servicesPage.getTotalPages());
            response.put("pageSize", servicesPage.getSize());
            response.put("sortBy", sortBy);
            response.put("direction", direction);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while searching services: " + e.getMessage());
        }
    }

    public ResponseEntity<Object> getTicketsByServiceId(String serviceID) {
        try {
            TicketVenue ticketVenue = (TicketVenue) serviceRepo.findById(serviceID)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Ticket venue not found"));

            return ResponseEntity.ok(ticketVenue.getTicketList());
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while retrieving top-rated services");
        }
    }
}
