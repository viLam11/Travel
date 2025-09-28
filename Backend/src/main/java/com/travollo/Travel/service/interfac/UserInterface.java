package com.travollo.Travel.service.interfac;

import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import org.hibernate.mapping.Any;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface UserInterface {
    ResponseEntity<Object> register(User userCredentials);
    ResponseEntity<Object> login(User loginRequest);
    ResponseEntity<Object> getAllUsers();
    ResponseEntity<UserDTO> getUserById(Long userID);
    ResponseEntity<List<Order>> getOrdersByUserId(Long userID);
    ResponseEntity<Object> updateUser(Long userID, User user);
}
