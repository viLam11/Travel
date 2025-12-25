package com.travollo.Travel.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private Long roomID;
    private String type;
    private String name;
    private int quantity;
    private String description;
}
