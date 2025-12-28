package com.travollo.Travel.controller;

import com.travollo.Travel.dto.VerifyDTO;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.impl.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepo userRepo;
    private final UserService userService;

    public UserController(UserRepo userRepo, UserService userService) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String principal = authentication.getName();
        java.util.Optional<com.travollo.Travel.entity.User> userOpt;
        
        if (principal.contains("@")) {
            userOpt = userRepo.findByEmail(principal);
        } else {
            userOpt = userRepo.findByUsername(principal);
        }
        
        return userOpt
                .map(user -> ResponseEntity.ok(com.travollo.Travel.utils.Utils.mapUserEntityToDTO(user)))
                .orElse(ResponseEntity.status(404).build());
    }

    @GetMapping("/{userID}")
    public ResponseEntity<?> getUserById(@PathVariable Long userID) {
        return userService.getUserById(userID);
    }

    @PutMapping("/{userID}")
    public ResponseEntity<Object> updateUser(@PathVariable Long userID, @RequestBody User user) {
        return userService.updateUser(userID, user);
    }

}
