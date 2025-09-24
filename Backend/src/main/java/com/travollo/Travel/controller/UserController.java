package com.travollo.Travel.controller;

import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.impl.UserService;
import org.hibernate.mapping.Any;
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

    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody User userCredentials) {
        System.out.println("Registering user: " + userCredentials);
        return userService.register(userCredentials);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody User userCredentials) {
        System.out.println("Logging in user: " + userCredentials);
        return userService.login(userCredentials);
    }
}
