package com.travollo.Travel.service;

import com.travollo.Travel.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomerUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepo theUserRepo;

    @Override
    public UserDetails loadUserByUsername(String email) {
        return theUserRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Username not found"));
    }

}
