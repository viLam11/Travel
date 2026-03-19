package com.travollo.Travel.domains.user.controller;

import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.domains.travel.repo.ServiceRepo;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.domains.user.service.UserService;
import com.travollo.Travel.utils.CurrentUser;
import com.travollo.Travel.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepo userRepo;
    private final UserService userService;
    private final ServiceRepo serviceRepo;

    @GetMapping("/test")
    public ResponseEntity<String> test(@CurrentUser User currentUser) {
        System.out.println("Current User: " + currentUser);
        return ResponseEntity.ok(currentUser.toString());
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            @CurrentUser User currentUser
    ) {
        String myServiceId = null;

        if (currentUser.getRole() == Role.PROVIDER_HOTEL || currentUser.getRole() == Role.PROVIDER_VENUE) {
            TService serviceOpt = serviceRepo.findByProvider(currentUser);
            myServiceId = serviceOpt.getId();
        }

        Map<String, Object> responseObj = new HashMap<>();
        responseObj.put("userID", currentUser.getUserID());
        responseObj.put("username", currentUser.getUsername());
        responseObj.put("email", currentUser.getEmail());
        responseObj.put("fullname", currentUser.getFullname());
        responseObj.put("phone", currentUser.getPhone());
        responseObj.put("avatarUrl", currentUser.getAvatarUrl());
        responseObj.put("role", currentUser.getRole().name());
        responseObj.put("address", currentUser.getAddress());

        responseObj.put("serviceId", myServiceId);

        return ResponseEntity.ok(responseObj);
    }

    @GetMapping("/{userID}")
    public ResponseEntity<?> getUserById(@PathVariable String userID) {
        return userService.getUserById(userID);
    }

    @PutMapping("/{userID}")
    public ResponseEntity<Object> updateUser(@PathVariable String userID, @RequestBody User user) {
        return userService.updateUser(userID, user);
    }

}
