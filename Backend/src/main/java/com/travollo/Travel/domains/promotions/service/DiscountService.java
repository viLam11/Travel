package com.travollo.Travel.domains.promotions.service;


import com.travollo.Travel.domains.promotions.dto.DiscountRequest;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.repo.DiscountRepo;
import com.travollo.Travel.entity.Discount;
import com.travollo.Travel.entity.FixedPriceDiscount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepo discountRepo;

    @Transactional
    public DiscountResponse createDiscount(DiscountRequest request) {
        Discount discount;
        // Logic kiểm tra nếu có fixedPrice thì tạo FixedPriceDiscount
        if (request.getFixedPrice() != null) {
            FixedPriceDiscount fixedDiscount = new FixedPriceDiscount();
            fixedDiscount.setFixedPrice(request.getFixedPrice());
            discount = fixedDiscount;
        } else {
            discount = new Discount();
        }
        mapRequestToEntity(request, discount);
        Discount saved = discountRepo.save(discount);
        return mapToResponse(saved);
    }

    public List<DiscountResponse> getAllDiscounts() {
        return discountRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DiscountResponse getDiscountById(Long id) {
        Discount discount = discountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
        return mapToResponse(discount);
    }

    @Transactional
    public DiscountResponse updateDiscount(Long id, DiscountRequest request) {
        Discount discount = discountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));

        mapRequestToEntity(request, discount);
        if (discount instanceof FixedPriceDiscount && request.getFixedPrice() != null) {
            ((FixedPriceDiscount) discount).setFixedPrice(request.getFixedPrice());
        }

        return mapToResponse(discountRepo.save(discount));
    }

    @Transactional
    public void deleteDiscount(Long id) {
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
    }

    private DiscountResponse mapToResponse(Discount entity) {
        Double fixedPrice = null;
        if (entity instanceof FixedPriceDiscount) {
            fixedPrice = ((FixedPriceDiscount) entity).getFixedPrice();
        }

        return DiscountResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .quantity(entity.getQuantity())
                .minSpend(entity.getMinSpend())
                .applyType(entity.getApplyType())
                .fixedPrice(fixedPrice)
                .build();
    }
}
