package com.travollo.Travel.domains.hotel.dto;

import com.travollo.Travel.utils.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponseDTO {
    private String id;
    private RoomType type;
    private BigDecimal price;
    private int quantity;
    private String name;
    private String description;
    private String roomImgUrl;
    private List<String> images = new ArrayList<>();
    private String hotelId;
    private String hotelName;
}
