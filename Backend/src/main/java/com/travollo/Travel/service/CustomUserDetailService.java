package com.travollo.Travel.service;

import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepo theUserRepo;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) {
        User foundUser;
        if (usernameOrEmail.contains("@")) {
            foundUser = theUserRepo.findByEmail(usernameOrEmail)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Email not found"));
        } else {
            foundUser = theUserRepo.findByUsername(usernameOrEmail)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Username not found"));
        }
        return Utils.mapUserEntityToUserDetails(foundUser);
    }
}
