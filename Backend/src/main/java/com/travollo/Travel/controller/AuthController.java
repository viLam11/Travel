package com.travollo.Travel.controller;


import com.travollo.Travel.dto.LoginRequest;
import com.travollo.Travel.dto.LoginResponseDTO;
import com.travollo.Travel.dto.VerifyDTO;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import com.travollo.Travel.service.impl.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    final private UserService userService;
    final private UserRepo userRepo;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientID;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;


    public AuthController(UserService userService, UserRepo userRepo) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    @PostMapping("/register/local")
    public ResponseEntity<Object> register(@RequestBody User userCredentials) {
        return userService.register(userCredentials);
    }

    @PostMapping("/login/local")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @PostMapping("/verify")
    public ResponseEntity<Object> verify(@RequestBody VerifyDTO input) {
        return userService.verifyUser(input);
    }

<<<<<<< HEAD
    @PostMapping("/resend-otp")
    public ResponseEntity<Object> resendOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        return userService.resendVerificationCode(email);
    }

    // ==================== FORGOT PASSWORD ENDPOINTS ====================
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody com.travollo.Travel.dto.ForgotPasswordRequest request) {
        return userService.sendPasswordResetOTP(request.getEmail());
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<Object> verifyResetOTP(@RequestBody com.travollo.Travel.dto.VerifyResetOTPRequest request) {
        return userService.verifyPasswordResetOTP(request.getEmail(), request.getOtp());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody com.travollo.Travel.dto.ResetPasswordRequest request) {
        return userService.resetPassword(request.getToken(), request.getNewPassword());
    }

    @GetMapping("/login/google")

=======
    @GetMapping("/login/google")
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
    public void loginGoogleAuth(HttpServletResponse response) throws IOException {
         response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/googleSuccess")
    public ResponseEntity<?> handleGoogleSuccess(@RequestParam String code)  {
        System.out.println("Authorization code: " + code);
        return ResponseEntity.ok("Google authentication successful!");
    }

    @GetMapping("/googleFailure")
    public ResponseEntity<String> handleGoogleFailure(@RequestParam String error) {
        System.out.println("Error: " + error);
        return ResponseEntity.status(401).body("Google authentication failed!");
    }

    @GetMapping("/auth/googleSuccess")
    public ResponseEntity<?> handleGoogleLogin(OAuth2AuthenticationToken authentication) {
        OAuth2User oAuth2User = authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        System.out.println("User email: " + email);
        System.out.println("User name: " + name);

        return ResponseEntity.ok(Map.of("email", email, "name", name));
    }

}
