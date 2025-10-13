package com.travollo.Travel.service.impl;

import com.travollo.Travel.entity.User;
import org.hibernate.mapping.Any;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.function.EntityResponse;

@Service
public class TravelService {
    EntityResponse<Any> register(User loginRequest) {
        return null;
    }
}
