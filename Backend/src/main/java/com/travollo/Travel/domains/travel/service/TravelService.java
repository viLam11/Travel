package com.travollo.Travel.domains.travel.service;

import com.travollo.Travel.domains.comments.repo.CommentServiceRepo;
import com.travollo.Travel.domains.ticket.repo.TicketRepo;
import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.domains.travel.dto.ServiceSearchRequest;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.*;
import com.travollo.Travel.service.AwsS3Service;
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

import java.util.*;

@Service
public class TravelService {
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
                List<Comment> commentList = optionalTService.get().getCommentList();
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
                img.setDescription("Description: " + url);
                img.setTService(service);
                imageEntities.add(img);
            }

            imgServiceRepo.saveAll(imageEntities);

            return ResponseEntity.ok().body("Re-up images");
        } catch (Exception e){
            throw new CustomException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

//    public ResponseEntity<Object> createService(NewServiceRequest request)
//    {
//        try {
//            TService newTService = modelMapper.map(request, TService.class);
//            newTService.setThumbnailUrl(awsS3Service.saveImageToS3(request.getThumbnail()));
//            return ResponseEntity.status(HttpStatus.CREATED).body(serviceRepo.save(newTService));
//        } catch (Exception e) {
//            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
//        }
//    }

    public ResponseEntity<Object> createService(NewServiceRequest request, User provider) {
        TService newTService;
        ServiceType serviceType = request.getServiceType();

        if (ServiceType.HOTEL == serviceType) {
            newTService = new Hotel();
        } else if ("TICKET_VENUE".equals(serviceType)) {
            TicketVenue ticketVenue = new TicketVenue();
            if (request.getStart_time() != null && !request.getStart_time().isEmpty()) {
                ticketVenue.setStartTime(java.sql.Time.valueOf(request.getStart_time()));
            }
            if (request.getEnd_time() != null && !request.getEnd_time().isEmpty()) {
                ticketVenue.setEndTime(java.sql.Time.valueOf(request.getEnd_time()));
            }
            newTService = ticketVenue;
        } else {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Loại dịch vụ không hợp lệ: " + serviceType);
        }

        newTService.setServiceName(request.getServiceName());
        newTService.setDescription(request.getDescription());
        newTService.setAddress(request.getAddress());
        newTService.setContactNumber(request.getContactNumber());
        newTService.setAveragePrice(request.getAveragePrice());
        newTService.setTags(request.getTags());
        newTService.setServiceType(serviceType);

        newTService.setProvider(provider);

        if (request.getProvinceCode() != null) {
            Province province = provinceRepo.findById(request.getProvinceCode()).orElse(null);
            newTService.setProvince(province);
        }

        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            newTService.setThumbnailUrl(awsS3Service.saveImageToS3(request.getThumbnail()));
        }

        // 3. Save xuống Database (Hibernate sẽ tự Insert 2 bảng nhờ tính đa hình)
        TService savedService = serviceRepo.save(newTService);

        // 4. Xử lý lưu các ảnh phụ vào bảng ImageService (nếu có)
        if (request.getPhoto() != null && !request.getPhoto().isEmpty()) {
            uploadImages(savedService.getId(), request.getPhoto());
            // Cập nhật lại entity sau khi đã đính kèm ảnh
            savedService = serviceRepo.findById(savedService.getId())
                    .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tìm thấy Service sau khi lưu"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
    }

//    public ResponseEntity<Object> createService(MultipartFile thumbnail, String serviceName, String description, String provinceCode,
//                                                String address, String contactNumber, Long averagePrice,
//                                                String tags, ServiceType serviceType, User provider,
//                                                List<MultipartFile> photos,
//                                                Time start_time, Time end_time, Time open_time, Time close_time, String working_days
//    )
//    {
//        try {
//            TService newTService;
//            String thumbnailUrl = null;
//            if (thumbnail != null && !thumbnail.isEmpty()) {
//                thumbnailUrl = awsS3Service.saveImageToS3(thumbnail);
//            }
//            Province province = provinceRepo.findById(provinceCode).orElse(null);
//
//            if (ServiceType.HOTEL == serviceType) {
//                Hotel hotel = new Hotel();
//                newTService = hotel;
//            }  else  {
//                TicketVenue ticketVenue = new TicketVenue();
//                ticketVenue.setStartTime(start_time);
//                ticketVenue.setEndTime(end_time);
//                newTService = ticketVenue;
//            }
//            newTService.setServiceName(serviceName);
//            newTService.setDescription(description);
//            newTService.setProvince(province);
//            newTService.setAddress(address);
//            newTService.setContactNumber(contactNumber);
//            newTService.setAveragePrice(averagePrice);
//            newTService.setTags(tags);
//            newTService.setServiceType(serviceType);
//            newTService.setProvider(provider);
//            newTService.setThumbnailUrl(thumbnailUrl);
//
//            System.out.println("New Service: " + newTService);
//
//            TService savedService =  serviceRepo.save(newTService);
//            if (photos != null && !photos.isEmpty()) {
//                uploadImages(savedService.getId(), photos);
//                savedService = serviceRepo.findById(savedService.getId())
//                        .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Service not found after saving"));
//
//            }
//            return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
//        } catch (Exception e) {
//            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
//        }
//    }

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
    }

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
    }

    public ResponseEntity<Object> searchServices(
            ServiceSearchRequest searchRequest
    ) {
        try {
            Sort sort = searchRequest.getDirection().equalsIgnoreCase("desc") ?
                    Sort.by(searchRequest.getSortBy()).descending() :
                    Sort.by(searchRequest.getSortBy()).ascending();

            Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);

            ServiceType serviceTypeEnum = searchRequest.getServiceType() != null ? ServiceType.valueOf(searchRequest.getServiceType().toUpperCase()) : null;

            String searchKeyword = (searchRequest.getKeyword() == null || searchRequest.getKeyword().trim().isEmpty()) ? null :
            searchRequest.getKeyword().trim();
            Long searchMinPrice = (searchRequest.getMinPrice() == null) ? 0L :searchRequest.getMinPrice();
            Long searchMaxPrice = (searchRequest.getMaxPrice() == null) ? Long.MAX_VALUE : searchRequest.getMaxPrice();

            Page<TService> servicesPage = serviceRepo.searchServices(
                    searchKeyword,
                    searchRequest.getProvinceCode(),
                    serviceTypeEnum,
                    searchMinPrice,
                    searchMaxPrice,
                    searchRequest.getMinRating(),
                    pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("services", servicesPage.getContent());
            response.put("currentPage", servicesPage.getNumber());
            response.put("totalItems", servicesPage.getTotalElements());
            response.put("totalPages", servicesPage.getTotalPages());
            response.put("pageSize", servicesPage.getSize());
            response.put("sortBy", searchRequest.getSortBy());
            response.put("direction", searchRequest.getDirection());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while searching services: " + e.getMessage());
        }
    }



}
