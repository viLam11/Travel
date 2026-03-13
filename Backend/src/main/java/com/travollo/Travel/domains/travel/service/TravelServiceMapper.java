package com.travollo.Travel.domains.travel.service;

import com.travollo.Travel.domains.travel.dto.NewServiceRequest;
import com.travollo.Travel.entity.TService;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "string",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TravelServiceMapper {
    void patchRequest(NewServiceRequest updatedRequest, @MappingTarget TService existingService);

}
