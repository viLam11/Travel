package com.travollo.Travel.controller;

import com.travollo.Travel.entity.Service;
import com.travollo.Travel.repo.ServiceRepo;
import com.travollo.Travel.service.AwsS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/services")
public class ServiceController {
    @Autowired
    private AwsS3Service awsS3Service;

    @Autowired
    private ServiceRepo serviceRepo;

}
