package com.travollo.Travel.domains.hotel.service;

import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE
)
public interface RoomMapper {
    void patchRequest(NewRoomRequest updateRequest, @MappingTarget Room room);
}
