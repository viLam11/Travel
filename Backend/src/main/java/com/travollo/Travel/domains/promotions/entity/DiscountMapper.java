package com.travollo.Travel.domains.promotions.entity;


import com.travollo.Travel.domains.promotions.dto.DiscountRequest;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.dto.DiscountType;
import com.travollo.Travel.entity.Province;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.repo.ServiceRepo;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public abstract class DiscountMapper {
    @Autowired
    protected ServiceRepo  tServiceRepo;
    @Autowired
    protected ProvinceRepo provinceRepo;

    public abstract void patchRequest(DiscountRequest request, @MappingTarget Discount discount);

    public abstract DiscountResponse toResponse(Discount discount);

    public  DiscountServiceRe mapStringToDiscountServiceRe(String serviceId) {
        if (serviceId == null) {
            return null;
        }
        DiscountServiceRe serviceRe = new DiscountServiceRe();
        TService foundedService = tServiceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + serviceId));
        serviceRe.setTService(foundedService);
        return serviceRe;
    }

    public DiscountProvinceRe mapStringToDiscountProvinceRe(String provinceId) {
        if (provinceId == null) {
            return null;
        }
        DiscountProvinceRe provinceRe = new DiscountProvinceRe();
        Province foundedProvince = provinceRepo.findById(provinceId)
                .orElseThrow(() -> new RuntimeException("Province not found with id: " + provinceId));
        provinceRe.setProvince(foundedProvince);
        return provinceRe;
    }

    // XỬ LÝ CLASS CON KHI TRẢ VỀ RESPONSE
    @AfterMapping
    protected void mapRequestToSubclass(DiscountRequest request, @MappingTarget Discount discount) {
        if (discount instanceof FixedPriceDiscount fixedDiscount && request.getFixedPrice() != null) {
            fixedDiscount.setFixedPrice(request.getFixedPrice());
        }
        else if (discount instanceof PercentageDiscount percentDiscount) {
            if (request.getPercentage() != null) {
                percentDiscount.setPercentage(request.getPercentage());
            }
            if (request.getMaxDiscountAmount() != null) {
                percentDiscount.setMaxDiscountAmount(request.getMaxDiscountAmount());
            }
        }
    }

    @AfterMapping
    protected void mapSubclassFields(Discount discount, @MappingTarget DiscountResponse response) {
        if (discount instanceof FixedPriceDiscount fixedPriceDiscount) {
            response.setDiscountType(DiscountType.Fixed);
            response.setFixedPrice(fixedPriceDiscount.getFixedPrice());
        } else if (discount instanceof PercentageDiscount percentageDiscount) {
            response.setDiscountType(DiscountType.Percentage);
            response.setPercentage(percentageDiscount.getPercentage());
            response.setMaxDiscountAmount(percentageDiscount.getMaxDiscountAmount());
        }
    }
}
