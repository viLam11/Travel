package com.travollo.Travel.service.impl;

import com.travollo.Travel.dto.LoginResponseDTO;
import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.dto.VerifyDTO;
import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.EmailService;
import com.travollo.Travel.service.interfac.UserInterface;
import com.travollo.Travel.utils.JWTUtils;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import jakarta.mail.MessagingException;
import org.joda.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

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

    @Autowired
    private EmailService emailService;

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
            userCredentials.setVerificationCode(generateVerificationCode());
            userCredentials.setExpiredAt(LocalDateTime.now().plusHours(1));
            userCredentials.setEnabled(false);

            sendVerificationEmail(userCredentials);

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

            if (!user.isEnabled()) {
                throw new RuntimeException("Account not verified. Please verify your account.");
            }

            UserDetails userDetail = Utils.mapUserEntityToUserDetails(user);
            if (!userDetail.isEnabled()){
                response = ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Account not verified. Please verify your account by email");
            }

           var token = jwtUtils.generateToken(userDetail);

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

    public void resendVerificationCode(String email) {
        Optional<User> optionalUser = theUserRepo.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new RuntimeException("Account is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setExpiredAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            theUserRepo.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    private void sendVerificationEmail(User user) { //TODO: Update with company logo
        String subject = "Account Verification";
        String verificationCode = "VERIFICATION CODE " + user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    };

    @Override
    public ResponseEntity<Object> verifyUser(VerifyDTO verifyDTO) {
        ResponseEntity<Object> response = null;
        Optional<User> optionalUser = theUserRepo.findByEmail(verifyDTO.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getExpiredAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }
            if (verifyDTO.getVerificationCode().equals(user.getVerificationCode())) {
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setExpiredAt(null);
                theUserRepo.save(user);
            } else {
                response = ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code");
            }
        } else {
            response = ResponseEntity.status(HttpStatus.OK).body("User not found");
        }
        return response;
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
