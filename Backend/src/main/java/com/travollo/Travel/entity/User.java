package com.travollo.Travel.entity;

import com.travollo.Travel.utils.AuthType;
import com.travollo.Travel.utils.Role;
import jakarta.persistence.*;
import jakarta.validation.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;

    @NotBlank(message = "Username is required")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
    private String fullname;
    private String phone;
    private String address;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('USER', 'ADMIN', 'PROVIDER')")
    private Role role;

    @Column(name = "verification_code")
    private String verificationCode;
    @Column(name = "code_expired_at")
    private LocalDateTime expiredAt;

    private boolean isEnabled;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('LOCAL', 'GOOGLE', 'FACEBOOK') DEFAULT 'LOCAL'")
    private AuthType authProvider = AuthType.LOCAL;
}

