package com.travollo.Travel.service.impl;

import com.travollo.Travel.dto.LoginResponseDTO;
import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.interfac.UserInterface;
import com.travollo.Travel.utils.JWTUtils;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserInterface {
    @Autowired
    private UserRepo theUserRepo;

    @Autowired
    private PasswordEncoder thePasswordEncoder;

    @Autowired
    private AuthenticationManager theAuthenticationManager;

    @Autowired
    private JWTUtils jwtUtils;

    @Override
    public ResponseEntity<Object> register(User userCredentials){
        ResponseEntity<Object> response = null;

        System.out.println("User: " + userCredentials.toString());

        try {
            if (userCredentials.getRole() == null ) {
                userCredentials.setRole(Role.USER);
            }

            if (theUserRepo.existsByEmail(userCredentials.getEmail())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Email is already in use");
            }

            userCredentials.setPassword(thePasswordEncoder.encode(userCredentials.getPassword()));
            User savedUser = theUserRepo.save(userCredentials);
            UserDTO userDTO = Utils.mapUserEntityToDTO(savedUser);
            response = ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(userDTO);

        } catch(CustomException e) {
            response = ResponseEntity
                        .status(e.getStatus())
                        .body(e.getMessage());
        }

        catch (Exception e) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Error during registration: " + e.getMessage());
        }

        return response;
    };

    @Override
    public ResponseEntity<Object> login(User loginRequest) {
         ResponseEntity<Object> response = null;

        try {
            theAuthenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
           var user = theUserRepo.findByEmail(loginRequest.getEmail())
                   .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
           System.out.println("Authenticated User: " + user.toString());
           var token = jwtUtils.generateToken(user);
           System.out.println("Generated Token: " + token);
            LoginResponseDTO loginResponse = new LoginResponseDTO(token, Utils.mapUserEntityToDTO(user), user.getRole());
            response = ResponseEntity
                    .status(HttpStatus.OK)
                    .body(loginResponse);
        } catch(CustomException e) {
            response = ResponseEntity
                    .status(e.getStatus())
                    .body(e.getMessage());
        }
        return  response;
    };

    @Override
    public ResponseEntity<Object> getAllUsers(){
        ResponseEntity<Object> response = null;
        try {
            List<User> users = theUserRepo.findAll();
            List<UserDTO> userDTOs = users.stream().map(Utils::mapUserEntityToDTO).toList();
            response = ResponseEntity
                    .status(HttpStatus.OK)
                    .body(userDTOs);
            return response;
        } catch (Exception e) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Error fetching users: " + e.getMessage());
        }
    };

    @Override
    public ResponseEntity<UserDTO> getUserById(Long userID){
        return null;
    };

    @Override
    public ResponseEntity<List<Order>> getOrdersByUserId(Long userID){
        return null;
    };

    @Override
    public ResponseEntity<Object> updateUser(Long userID, User user){
        return null;
    };
}
