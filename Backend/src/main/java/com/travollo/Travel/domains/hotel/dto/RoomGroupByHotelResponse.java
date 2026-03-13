package com.travollo.Travel.domains.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomGroupByHotelResponse {
    private String hotelId;
    private String hotelName;

    private List<RoomResponseDTO> rooms;
}
