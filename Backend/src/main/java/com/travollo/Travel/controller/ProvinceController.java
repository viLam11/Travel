package com.travollo.Travel.controller;

import com.travollo.Travel.entity.Province;
import com.travollo.Travel.repo.ProvinceRepo;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/search")
    public ResponseEntity<List<Province>> searchProvinces(@RequestParam("query") String query) {
        List<Province> provinces = provinceRepo.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/region/{regionName}")
    public ResponseEntity<List<Province>> getProvincesByRegion(@PathVariable String regionName) {
        // regionName expected: 'north', 'central', 'south'
        List<Province> provinces = provinceRepo.findByMacroRegion(regionName);

        // Populate images for each province from available services
        for (Province p : provinces) {
            try {
                com.travollo.Travel.entity.TService service = serviceRepo.findFirstByProvinceCodeAndThumbnailUrlNotNull(p.getCode());
                if (service != null && service.getThumbnailUrl() != null) {
                    p.setImageUrl(service.getThumbnailUrl());
                } else {
                    // Placeholder if no service image found
                    p.setImageUrl("https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80");
                }
            } catch (Exception e) {
                // Fallback on error
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