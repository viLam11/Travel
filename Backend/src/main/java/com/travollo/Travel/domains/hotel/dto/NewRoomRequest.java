package com.travollo.Travel.domains.hotel.dto;

import com.travollo.Travel.utils.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewRoomRequest {
    private RoomType type;
    private BigDecimal price;
    private int quantity;
    private String name;
    private String description;
    private MultipartFile roomImage;
    private List<MultipartFile> images;
}
