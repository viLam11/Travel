package com.travollo.Travel.controller;

import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.service.impl.TravelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/services")
public class ServiceController {
    @Autowired
    private AwsS3Service awsS3Service;

    @Autowired
    private TravelService travelService;

    @GetMapping("/all")
    ResponseEntity<Object> getAllServices(){
        return travelService.getAllServices();
    }

    @PostMapping("/{serviceID}")
    ResponseEntity<Object> getServiceById(@RequestParam Long serviceID){
        return travelService.getServiceById(serviceID);
    }

}
