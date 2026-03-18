package com.travollo.Travel.domains.travel.service;

import com.travollo.Travel.domains.comments.repo.CommentServiceRepo;
import com.travollo.Travel.domains.hotel.entity.Hotel;
import com.travollo.Travel.domains.ticket.repo.TicketRepo;
import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.domains.travel.dto.ServiceFilterDTO;
import com.travollo.Travel.domains.travel.dto.ServiceSearchRequest;
import com.travollo.Travel.domains.travel.dto.UpdatedServiceRequest;
import com.travollo.Travel.domains.travel.repo.ServiceRepo;
import com.travollo.Travel.domains.travel.repo.ServiceSpecifications;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.domains.travel.entity.ImageService;
import com.travollo.Travel.entity.Province;
import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.domains.ticket.entity.TicketVenue;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.domains.travel.repo.ImageServiceRepo;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.utils.ServiceType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelService {
    private final ServiceRepo serviceRepo;
    private final AwsS3Service awsS3Service;
    private final ProvinceRepo provinceRepo;
    private final ImageServiceRepo imgServiceRepo;
    private final CommentServiceRepo commentRepo;
    private final TicketRepo ticketRepo;
    private final TravelServiceMapper travelServiceMapper;
//    private final ServiceSpecifications serviceSpecifications;

    public List<TService> getAllServices() {
        return serviceRepo.findAll();
    }

    public TService getServiceById(String serviceID) {
        return serviceRepo.findById(serviceID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found service"));
    }
//
//    public ResponseEntity<Object> getServices(int page, int size, String sortBy, String direction) {
//        try {
//            Sort sort = direction.equalsIgnoreCase("desc") ?
//                    Sort.by(sortBy).descending() :
//                    Sort.by(sortBy).ascending();
//
//            Pageable pageable = PageRequest.of(page, size, sort);
//            Page<TService> servicesPage;
//            servicesPage = serviceRepo.findAll(pageable);
//            System.out.println("Services Page: " + servicesPage);
//            Map<String, Object> response = new HashMap<>();
//            response.put("services", servicesPage.getContent());
//            response.put("currentPage", servicesPage.getNumber());
//            response.put("totalItems", servicesPage.getTotalElements());
//            response.put("totalPages", servicesPage.getTotalPages());
//            response.put("pageSize", servicesPage.getSize());
//            response.put("sortBy", sortBy);
//            response.put("direction", direction);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while retrieving paginated services: " + e.getMessage());
//        }
//    }

    public String uploadImages(String id, List<MultipartFile> photos) {
        List<String> urls = awsS3Service.saveImagesToS3(photos);
        TService service = serviceRepo.findById(id).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found service"));
        List<ImageService> imageEntities = new ArrayList<>();

        for (String url : urls) {
            ImageService img = new ImageService();
            img.setImageUrl(url);
            img.setDescription("Description: " + url);
            img.setTService(service);
            imageEntities.add(img);
        }

        imgServiceRepo.saveAll(imageEntities);
        return "Upload successfully";
    }

    public TService createService(NewServiceRequest request, User provider) {
        TService newTService;
        ServiceType serviceType = request.getServiceType();

        if (ServiceType.HOTEL == serviceType) {
            newTService = new Hotel();
        } else if (serviceType == ServiceType.TICKET_VENUE) {
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

        return savedService;
    }

//    public TService updateService(String serviceID, TService updatedTService) {
//        TService existingTService = serviceRepo.findById(serviceID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found service"));
//        // Update fields
//        existingTService.setServiceName(updatedTService.getServiceName());
//        existingTService.setDescription(updatedTService.getDescription());
//        existingTService.setProvince(updatedTService.getProvince());
//        existingTService.setAddress(updatedTService.getAddress());
//        existingTService.setContactNumber(updatedTService.getContactNumber());
//        existingTService.setRating(updatedTService.getRating());
//        existingTService.setTags(updatedTService.getTags());
//        existingTService.setAveragePrice(updatedTService.getAveragePrice());
//        existingTService.setServiceType(updatedTService.getServiceType());
//        existingTService.setProvider(updatedTService.getProvider());
//        existingTService.setImageList(updatedTService.getImageList());
//
//        return serviceRepo.save(existingTService);
//    }

    @Transactional
    public TService updateService(String serviceId, UpdatedServiceRequest request, User currentUser) {
        TService existingService = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + serviceId));

        if (!existingService.getProvider().getUserID().equals(currentUser.getUserID())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa dịch vụ này!");
        }

        travelServiceMapper.patchRequest(request, existingService);

        // 4. Xử lý các logic đặc thù (nếu có)
        if (request.getThumbnailImg() != null) {
            String newThumbnailUrl = awsS3Service.saveImageToS3(request.getThumbnailImg());
            existingService.setThumbnailUrl(newThumbnailUrl);
        }

        // 2. Xử lý danh sách ảnh chi tiết mới (Upload nhiều file)
        if (request.getImageList() != null && !request.getImageList().isEmpty()) {
            if (existingService.getImageList() == null) {
                existingService.setImageList(new ArrayList<>());
            }

            // thì mở comment dòng dưới. Còn nếu muốn "THÊM VÀO" thì giữ nguyên.
            // existingService.getImageList().clear();

            List<String> s3ImageUrls = awsS3Service.saveImagesToS3(request.getImageList());

            for (String s3ImageUrl : s3ImageUrls) {
                ImageService newImage = new ImageService();
                newImage.setImageUrl(s3ImageUrl);
                newImage.setDescription("description...");
                newImage.setTService(existingService);
                existingService.getImageList().add(newImage);
            }
        }

        return serviceRepo.save(existingService);
    }

    public void deleteService(String serviceID) {
        serviceRepo.deleteById(serviceID);
    }

    public Page<TService> searchServices(
            ServiceSearchRequest searchRequest
    ) {
        Sort sort = searchRequest.getDirection().equalsIgnoreCase("desc") ?
                Sort.by(searchRequest.getSortBy()).descending() :
                Sort.by(searchRequest.getSortBy()).ascending();

        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);

        ServiceType serviceTypeEnum = searchRequest.getServiceType() != null ? ServiceType.valueOf(searchRequest.getServiceType().toUpperCase()) : null;

        String searchKeyword = (searchRequest.getKeyword() == null || searchRequest.getKeyword().trim().isEmpty()) ? null :
                searchRequest.getKeyword().trim();
        Long searchMinPrice = (searchRequest.getMinPrice() == null) ? 0L : searchRequest.getMinPrice();
        Long searchMaxPrice = (searchRequest.getMaxPrice() == null) ? Long.MAX_VALUE : searchRequest.getMaxPrice();

        return serviceRepo.searchServices(
                searchKeyword,
                searchRequest.getProvinceCode(),
                serviceTypeEnum,
                searchMinPrice,
                searchMaxPrice,
                searchRequest.getMinRating(),
                pageable
        );
    }

    public Page<TService> filterServices(ServiceFilterDTO filter) {
        List<Specification<TService>> specs = new ArrayList<>();
        // Thêm các điều kiện vào List
        if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
            specs.add(ServiceSpecifications.keywordContains(filter.getKeyword()));
        }
        if (filter.getName() != null && !filter.getName().isBlank()) {
            specs.add(ServiceSpecifications.nameContains(filter.getName()));
        }
        if (filter.getType() != null) {
            specs.add(ServiceSpecifications.hasServiceType(filter.getType()));
        }
        if (filter.getMinPrice() != null || filter.getMaxPrice() != null) {
            specs.add(ServiceSpecifications.priceBetween(filter.getMinPrice(), filter.getMaxPrice()));
        }
        if (filter.getProvinceCode() != null) {
            specs.add(ServiceSpecifications.hasProvince(filter.getProvinceCode()));
        }
        if (filter.getMinRating() != null) {
            specs.add(ServiceSpecifications.ratingGreaterThanOrEqual(filter.getMinRating()));
        }
        if (filter.getTag() != null) {
            specs.add(ServiceSpecifications.tagsContain(filter.getTag()));
        }
        if (filter.isOnlyWithImages()) {
            specs.add(ServiceSpecifications.hasImages());
        }

        Specification<TService> finalSpec = Specification.allOf(specs);
        Sort sort = filter.getDirection().equalsIgnoreCase("DESC")
                ? Sort.by(filter.getSortBy()).descending()
                : Sort.by(filter.getSortBy()).ascending();
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        return serviceRepo.findAll(finalSpec, pageable);
    }

}
