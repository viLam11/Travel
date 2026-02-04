package com.travollo.Travel.domains.promotions.controller;

import com.travollo.Travel.domains.promotions.dto.DiscountRequest;
import com.travollo.Travel.domains.promotions.dto.DiscountResponse;
import com.travollo.Travel.domains.promotions.service.DiscountService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping
    public ResponseEntity<DiscountResponse> create(@RequestBody DiscountRequest request) {
        return ResponseEntity.ok(discountService.createDiscount(request));
    }

    @GetMapping
    public ResponseEntity<List<DiscountResponse>> getAll() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(discountService.getDiscountById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountResponse> update(@PathVariable Long id, @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(discountService.updateDiscount(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }
}