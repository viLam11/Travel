package com.travollo.Travel.domains.travel.service;

import com.travollo.Travel.domains.travel.dto.UpdatedServiceRequest;
import com.travollo.Travel.entity.Province;
import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.repo.ProvinceRepo;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public abstract class TravelServiceMapper {
    @Autowired
    protected  ProvinceRepo provinceRepo;

    public TravelServiceMapper() {
    }

    @Mapping(target = "imageList", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "province", source="provinceCode", qualifiedByName = "mapProvince")
    public abstract void patchRequest(UpdatedServiceRequest updatedRequest, @MappingTarget TService existingService);

    @Named("mapProvince")
    protected Province mapProvince(String provinceCode) {
        if (provinceCode == null || provinceCode.isBlank()) {
            return null;
        }
        return provinceRepo.findById(provinceCode).orElse(null);
    }

}
