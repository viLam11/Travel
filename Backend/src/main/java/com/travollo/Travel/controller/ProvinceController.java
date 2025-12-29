package com.travollo.Travel.controller;

import com.travollo.Travel.entity.Province;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.repo.ProvinceRepo;
import com.travollo.Travel.utils.ServiceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/provinces")
@CrossOrigin
public class ProvinceController {

    @Autowired
    private ProvinceRepo provinceRepo;

    @Autowired
    private com.travollo.Travel.repo.ServiceRepo serviceRepo;

    @GetMapping("/search-provinces")
    public ResponseEntity<List<Province>> searchProvinces(@RequestParam("query") String query) {
        List<Province> provinces = provinceRepo.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/region/{regionName}")
    public ResponseEntity<List<Province>> getProvincesByRegion(@PathVariable String regionName) {
        List<Province> provinces = provinceRepo.findByMacroRegion(regionName);

        for (Province p : provinces) {
            try {
                com.travollo.Travel.entity.TService service = serviceRepo.findFirstByProvinceCodeAndThumbnailUrlNotNull(p.getCode());
                if (service != null && service.getThumbnailUrl() != null) {
                    p.setImageUrl(service.getThumbnailUrl());
                } else {
                   p.setImageUrl("https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80");
                }
            } catch (Exception e) {
                p.setImageUrl("https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80");
            }
        }
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Province>> getAllProvinces() {
        return ResponseEntity.ok(provinceRepo.findAll());
    }



}