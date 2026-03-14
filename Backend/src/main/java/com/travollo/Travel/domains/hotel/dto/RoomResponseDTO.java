package com.travollo.Travel.domains.hotel.dto;

import com.travollo.Travel.utils.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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
    private String imageUrl;
    private String hotelId;
    private String hotelName;
}
