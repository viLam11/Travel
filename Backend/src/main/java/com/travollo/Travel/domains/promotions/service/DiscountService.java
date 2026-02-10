package com.travollo.Travel.domains.promotions.service;


import com.travollo.Travel.domains.promotions.dto.DiscountRequest;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.dto.DiscountType;
import com.travollo.Travel.domains.promotions.entity.*;
import com.travollo.Travel.domains.promotions.repo.DiscountRepo;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.repo.ServiceRepo;
import com.travollo.Travel.utils.DiscountApplyType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class DiscountService {
    private final DiscountRepo discountRepo;
    private final ServiceRepo serviceRepo;
    private final ProvinceRepo provinceRepo;
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public DiscountResponse createDiscount(DiscountRequest request) {
        Discount discount;
        DiscountType type = request.getDiscountType();
        if (type == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Missing discountType value");
        }
        if (type == DiscountType.Fixed) {
            discount = FixedPriceDiscount.builder()
                    .fixedPrice(request.getFixedPrice())
                    .build();
        } else {
            discount = PercentageDiscount.builder()
                    .percentage(request.getPercentage())
                    .maxDiscountAmount(request.getMaxDiscountAmount())
                    .build();
        }
        discount = discountRepo.save(discount);
        mapRequestToEntity(request, discount);
        Discount savedDiscount = discountRepo.save(discount);
        return mapToResponse(savedDiscount);
    }

    public List<DiscountResponse> getAllDiscounts() {
        return discountRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DiscountResponse> getSatisfiedDiscount(String serviceID, String placeCode) {
        List<Discount> result = new ArrayList<>();
        // discount applied for all
        List<Discount> globalDiscounts = discountRepo.findByApplyType(DiscountApplyType.ALL);
        result.addAll(globalDiscounts);
        // discount for serviceID
        if (serviceID != null) {
            List<Discount> specificDiscounts = discountRepo.findByServiceList_TService_Id(serviceID);
            result.addAll(specificDiscounts);
        }
        if (placeCode != null) {
            List<Discount> discountOfProvince = discountRepo.findByProvinceList_Province_Code(placeCode);
            result.addAll(discountOfProvince);
        }
        return result.isEmpty() ? null : result.stream().map((discount) -> mapToResponse(discount)).collect(Collectors.toList());
    }

    public DiscountResponse getDiscountById(String id) {
        Discount discount = discountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
        return mapToResponse(discount);
    }

    @Transactional
    public DiscountResponse updateDiscount(String id, DiscountRequest request) {
        Discount discount = discountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
        mapRequestToEntity(request, discount);
        if (discount instanceof FixedPriceDiscount && request.getFixedPrice() != null) {
            ((FixedPriceDiscount) discount).setFixedPrice(request.getFixedPrice());
        }
        return mapToResponse(discountRepo.save(discount));
    }

    @Transactional
    public void deleteDiscount(String id) {
        discountRepo.deleteById(id);
    }

    // Helper methods
    private void mapRequestToEntity(DiscountRequest request, Discount entity) {
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setQuantity(request.getQuantity());
        entity.setMinSpend(request.getMinSpend());
        entity.setApplyType(request.getApplyType());
        DiscountApplyType applyType = request.getApplyType();
        if (applyType == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST,"Invalid apply type");
        }
        if (applyType == DiscountApplyType.SERVICE) {
            List<DiscountServiceRe> serviceList = request.getServiceList().stream()
                    .map((serviceID) -> {
                        DiscountServiceRe discountRe = new DiscountServiceRe();
                        discountRe.setDiscount(entity);
                        discountRe.setTService(serviceRepo.getReferenceById(serviceID));
                        return discountRe;
                    })
                    .collect(Collectors.toList());
            entity.setServiceList(serviceList);
        }
        else if (applyType == DiscountApplyType.CATEGORY) {
            DiscountCategoryRe cateRe = new DiscountCategoryRe();
            cateRe.setDiscount(entity);
            cateRe.setCategoryType(request.getCategoryType());

            entity.setCategoryApplyType(cateRe);
        } else if (applyType == DiscountApplyType.PROVINCE) {
            List<DiscountProvinceRe> provinceReList = request.getProvinceList().stream()
                    .map((provinceID) -> {
                        DiscountProvinceRe provinceRe = new DiscountProvinceRe();
                        provinceRe.setProvince(provinceRepo.getReferenceById(provinceID));
                        provinceRe.setDiscount(entity);
                        return provinceRe;
                    })
                    .collect(Collectors.toList());
            entity.setProvinceList(provinceReList);
        }
    }

    private DiscountResponse mapToResponse(Discount entity) {
        DiscountResponse.DiscountResponseBuilder builder = DiscountResponse.builder();
        if (entity instanceof FixedPriceDiscount) {
            Double fixedPrice = ((FixedPriceDiscount) entity).getFixedPrice();
            builder.fixedPrice(fixedPrice)
                    .discountType(DiscountType.Fixed);
        }
        if (entity instanceof PercentageDiscount) {
            Double percentage = ((PercentageDiscount) entity).getPercentage();
            Double maxDiscountAmount = ((PercentageDiscount) entity).getMaxDiscountAmount();
            builder.percentage(percentage)
                    .maxDiscountAmount(maxDiscountAmount);
        }

        builder
            .id(entity.getId())
            .name(entity.getName())
            .code(entity.getCode())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .quantity(entity.getQuantity())
            .minSpend(entity.getMinSpend());
        return builder.build();
    }
}
