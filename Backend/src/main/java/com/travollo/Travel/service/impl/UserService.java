package com.travollo.Travel.service.impl;

import com.travollo.Travel.dto.LoginResponseDTO;
import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.dto.ErrorResponse;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    private JWTUtils jwtUtils;
    @Autowired
    private AuthenticationManager theAuthenticationManager;
    @Autowired
    private EmailService emailService;

    @Override
    public ResponseEntity<Object> register(User userCredentials) {
        ResponseEntity<Object> response = null;

        try {
            // Check if email already exists
            if (theUserRepo.existsByEmail(userCredentials.getEmail())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Email already exists");
            }
            
            // Check if username already exists
            if (userCredentials.getUsername() != null && theUserRepo.existsByUsername(userCredentials.getUsername())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Username already exists");
            }

            userCredentials.setPassword(thePasswordEncoder.encode(userCredentials.getPassword()));
            userCredentials.setVerificationCode(generateVerificationCode());
            userCredentials.setExpiredAt(java.time.LocalDateTime.now().plusHours(1));
            userCredentials.setEnabled(false);
            Role userRole = userCredentials.getRole() != null ? userCredentials.getRole() : Role.USER;
            userCredentials.setRole(userRole);

            sendVerificationEmail(userCredentials);

            User savedUser = theUserRepo.save(userCredentials);
            UserDTO userDTO = Utils.mapUserEntityToDTO(savedUser);
            response = ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(userDTO);

        } catch(CustomException e) {
            ErrorResponse errorResponse = new ErrorResponse(e.getStatus().value(), e.getMessage());
            response = ResponseEntity
                        .status(e.getStatus())
                        .body(errorResponse);
        }

        catch (Exception e) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Error during registration: " + e.getMessage());
        }

        return response;
    };

    @Override
    public ResponseEntity<Object> login(String email, String password) {
         ResponseEntity<Object> response = null;

        try {
            theAuthenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            User user;
            if (email.contains("@")) {
                user = theUserRepo.findByEmail(email)
                        .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
            } else {
                 user = theUserRepo.findByUsername(email)
                        .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
            }

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

//    public void resendVerificationCode(String email) {
//        Optional<User> optionalUser = theUserRepo.findByEmail(email);
//        if (optionalUser.isPresent()) {
//            User user = optionalUser.get();
//            if (user.isEnabled()) {
//                throw new RuntimeException("Account is already verified");
//            }
//            user.setVerificationCode(generateVerificationCode());
//            user.setExpiredAt(LocalDateTime.now().plusHours(1));
//            sendVerificationEmail(user);
//            theUserRepo.save(user);
//        } else {
//            throw new RuntimeException("User not found");
//        }
//    }

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
        try {
            Optional<User> optionalUser = theUserRepo.findByEmail(verifyDTO.getEmail());
            if (!optionalUser.isPresent()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(404, "User not found"));
            }

            User user = optionalUser.get();
            
            // Check if verification code has expired
            if (user.getExpiredAt().isBefore(LocalDateTime.now())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(400, "Verification code has expired"));
            }
            
            // Check if verification code matches
            if (!verifyDTO.getVerificationCode().equals(user.getVerificationCode())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(400, "Invalid verification code"));
            }
            
            // Verify user
            user.setEnabled(true);
            user.setVerificationCode(null);
            user.setExpiredAt(null);
            theUserRepo.save(user);
            
            return ResponseEntity.ok(new ErrorResponse(200, "Account verified successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Verification failed: " + e.getMessage()));
        }
    };

    @Override
    public String authenWithGoogle(String email) {
        Optional<User> optionalUser = theUserRepo.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            UserDetails userDetail = Utils.mapUserEntityToUserDetails(user);
            String token = jwtUtils.generateToken(userDetail);
            return token;
        } else {
            throw new CustomException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

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
        try {
            User user = theUserRepo.findById(userID)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
            
            UserDTO userDTO = Utils.mapUserEntityToDTO(user);
            return ResponseEntity.ok(userDTO);
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(null);
        } catch (Exception e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching user: " + e.getMessage());
        }
    };

    @Override
    public ResponseEntity<List<Order>> getOrdersByUserId(Long userID){
        return null;
    };

    @Override
    public ResponseEntity<Object> updateUser(Long userID, User user){
        try {
            User existingUser = theUserRepo.findById(userID)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
            
            // Update only allowed fields
            if (user.getFullname() != null) {
                existingUser.setFullname(user.getFullname());
            }
            if (user.getPhone() != null) {
                existingUser.setPhone(user.getPhone());
            }
            if (user.getAddress() != null) {
                existingUser.setAddress(user.getAddress());
            }
            if (user.getDateOfBirth() != null) {
                existingUser.setDateOfBirth(user.getDateOfBirth());
            }
            if (user.getGender() != null) {
                existingUser.setGender(user.getGender());
            }
            if (user.getCity() != null) {
                existingUser.setCity(user.getCity());
            }
            if (user.getCountry() != null) {
                existingUser.setCountry(user.getCountry());
            }
            
            // Save updated user
            User updatedUser = theUserRepo.save(existingUser);
            UserDTO userDTO = Utils.mapUserEntityToDTO(updatedUser);
            
            return ResponseEntity.ok(userDTO);
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Error updating user: " + e.getMessage()));
        }
    };

    @Override
    public ResponseEntity<Object> resendVerificationCode(String email) {
        try {
            // Find user by email
            User user = theUserRepo.findByEmail(email)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));

            // Check if user is already verified
            if (user.isEnabled()) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Account is already verified");
            }

            // Generate new verification code
            user.setVerificationCode(generateVerificationCode());
            user.setExpiredAt(java.time.LocalDateTime.now().plusHours(1));

            // Save updated user
            theUserRepo.save(user);

            // Send verification email
            sendVerificationEmail(user);

            return ResponseEntity.ok(new ErrorResponse(200, "OTP has been resent successfully"));
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Failed to resend OTP: " + e.getMessage()));
        }
    }


    // ==================== FORGOT PASSWORD METHODS ====================
    
    @Override
    public ResponseEntity<Object> sendPasswordResetOTP(String email) {
        try {
            // Find user by email
            User user = theUserRepo.findByEmail(email)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Email not found"));

            // Check if user account is verified
            if (!user.isEnabled()) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Account not verified. Please verify your account first");
            }

            // Generate new OTP
            user.setVerificationCode(generateVerificationCode());
            user.setExpiredAt(java.time.LocalDateTime.now().plusHours(1));

            // Save updated user
            theUserRepo.save(user);

            // Send password reset email
            sendPasswordResetEmail(user);

            return ResponseEntity.ok(new ErrorResponse(200, "Password reset OTP has been sent to your email"));
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Failed to send password reset OTP: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<Object> verifyPasswordResetOTP(String email, String otp) {
        try {
            // Find user by email
            User user = theUserRepo.findByEmail(email)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));

            // Check if OTP has expired
            if (user.getExpiredAt() == null || user.getExpiredAt().isBefore(LocalDateTime.now())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(400, "OTP has expired. Please request a new one"));
            }

            // Check if OTP matches
            if (!otp.equals(user.getVerificationCode())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(400, "Invalid OTP"));
            }

            // Generate reset token (JWT)
            UserDetails userDetails = Utils.mapUserEntityToUserDetails(user);
            String resetToken = jwtUtils.generateToken(userDetails);

            // Return token
            return ResponseEntity.ok(new com.travollo.Travel.dto.ResetTokenResponse(
                    200, 
                    "OTP verified successfully", 
                    resetToken
            ));
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "OTP verification failed: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<Object> resetPassword(String token, String newPassword) {
        try {
            // Extract email from JWT token
            String email = jwtUtils.extractUsername(token);
            
            // Validate token
            User user = theUserRepo.findByEmail(email)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));
            
            UserDetails userDetails = Utils.mapUserEntityToUserDetails(user);
            if (!jwtUtils.isValidToken(token, userDetails)) {
                throw new CustomException(HttpStatus.UNAUTHORIZED, "Invalid or expired reset token");
            }

            // Validate new password
            if (newPassword == null || newPassword.length() < 8) {
                throw new CustomException(HttpStatus.BAD_REQUEST, 
                    "Password must be at least 8 characters");
            }
            
            if (!newPassword.matches(".*[A-Z].*") || 
                !newPassword.matches(".*[a-z].*") || 
                !newPassword.matches(".*\\d.*")) {
                throw new CustomException(HttpStatus.BAD_REQUEST, 
                    "Password must contain uppercase, lowercase and number");
            }

            // Update password
            user.setPassword(thePasswordEncoder.encode(newPassword));
            
            // Clear verification code and expiry
            user.setVerificationCode(null);
            user.setExpiredAt(null);
            
            theUserRepo.save(user);

            return ResponseEntity.ok(new ErrorResponse(200, "Password has been reset successfully"));
        } catch (CustomException e) {
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Password reset failed: " + e.getMessage()));
        }
    }

    private void sendPasswordResetEmail(User user) {
        String subject = "Password Reset Request";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Password Reset Request</h2>"
                + "<p style=\"font-size: 16px;\">You have requested to reset your password. Please use the OTP code below:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Your OTP Code:</h3>"
                + "<p style=\"font-size: 24px; font-weight: bold; color: #ff6b35; letter-spacing: 5px;\">" + verificationCode + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin-top: 20px;\">This OTP will expire in 1 hour.</p>"
                + "<p style=\"font-size: 14px; color: #666;\">If you didn't request this, please ignore this email.</p>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

}
