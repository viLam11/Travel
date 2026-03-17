package com.travollo.Travel.domains.travel.dto;

import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.utils.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatedServiceRequest {
    private String serviceName;
    private String description;
    private String provinceCode;
    private String address;
    private String contactNumber;
    private Long rating;
    private String tags;
    private Long averagePrice;
    private ServiceType serviceType;
    private Long minPrice = 0L;
    private User provider;
    private List<MultipartFile> imageList;
    private MultipartFile thumbnailImg;
}
