package com.travollo.Travel.service;

import com.travollo.Travel.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepo theUserRepo;

    @Override
    public UserDetails loadUserByUsername(String email) {
        System.out.println("Email: " + email);
        return theUserRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));
    }

}
