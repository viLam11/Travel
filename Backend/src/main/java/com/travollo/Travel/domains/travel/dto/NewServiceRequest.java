package com.travollo.Travel.domains.travel.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.sql.Time;
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
    private String serviceType;
    private List<MultipartFile> photo;

    // TICKET_VENUE
    private Time start_time;
    private Time end_time;

    // RESTAURANT
    private Time open_time;
    private Time close_time;
    private String working_days;
}
