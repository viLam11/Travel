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

    @GetMapping("/search")
    public ResponseEntity<List<Province>> searchProvinces(@RequestParam("query") String query) {
        List<Province> provinces = provinceRepo.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/region/{regionName}")
    public ResponseEntity<List<Province>> getProvincesByRegion(@PathVariable String regionName) {
        List<Province> provinces = provinceRepo.findByMacroRegion(regionName);
        return ResponseEntity.ok(provinces);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Province>> getAllProvinces() {
        return ResponseEntity.ok(provinceRepo.findAll());
    }
}
