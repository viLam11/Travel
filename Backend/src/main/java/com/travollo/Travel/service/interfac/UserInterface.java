package com.travollo.Travel.service.interfac;

import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.dto.VerifyDTO;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import org.hibernate.mapping.Any;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.util.List;

public interface UserInterface {
    ResponseEntity<Object> register(User userCredentials);
    ResponseEntity<Object> login(String username, String password);
    String authenWithGoogle(String code);
    ResponseEntity<Object> getAllUsers();
    ResponseEntity<UserDTO> getUserById(Long userID);
    ResponseEntity<List<Order>> getOrdersByUserId(Long userID);
    ResponseEntity<Object> updateUser(Long userID, User user);
    ResponseEntity<Object> verifyUser(VerifyDTO verifyDTO);
    ResponseEntity<Object> resendVerificationCode(String email);
    
    // Forgot Password methods
    ResponseEntity<Object> sendPasswordResetOTP(String email);
    ResponseEntity<Object> verifyPasswordResetOTP(String email, String otp);
    ResponseEntity<Object> resetPassword(String token, String newPassword);
}
