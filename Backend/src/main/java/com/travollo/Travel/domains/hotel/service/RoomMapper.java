package com.travollo.Travel.domains.hotel.service;

import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RoomMapper {
    void patchRequest(NewRoomRequest updateRequest, @MappingTarget Room room);
}
