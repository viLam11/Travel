package com.travollo.Travel.domains.travel.dto;

import com.travollo.Travel.utils.ServiceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class NewServiceRequest {
    private MultipartFile thumbnail;
    private String serviceName;
    private String description;
    private String provinceCode;
    private String address;
    private String contactNumber;
    private Long averagePrice;
    private String tags;
    private ServiceType serviceType;
    private List<MultipartFile> photo;

    // TICKET_VENUE
    @Schema(description = "Giờ bắt đầu/mở cửa (BẮT BUỘC theo format HH:mm:ss)", example = "08:00:00")
    private String start_time;
    @Schema(description = "Giờ kết thúc/đóng cửa (BẮT BUỘC theo format HH:mm:ss)", example = "21:30:00")
    private String end_time;
}
