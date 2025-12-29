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
<<<<<<< HEAD
    public UserDetails loadUserByUsername(String usernameOrEmail) {
        User foundUser;
        if (usernameOrEmail.contains("@")) {
            foundUser = theUserRepo.findByEmail(usernameOrEmail)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Email not found"));
        } else {
            foundUser = theUserRepo.findByUsername(usernameOrEmail)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Username not found"));
        }
=======
    public UserDetails loadUserByUsername(String email) {
        System.out.println("Email: " + email);
        User foundUser = theUserRepo.findByEmail(email)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "email not exists"));
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
        return Utils.mapUserEntityToUserDetails(foundUser);
    }
}
