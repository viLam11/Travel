package com.travollo.Travel.entity;

import com.travollo.Travel.utils.Role;
import jakarta.persistence.*;
import jakarta.validation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.groups.Default;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.joda.time.DateTime;
import org.joda.time.LocalDateTime;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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

    @Column(name="verification_code")
    private String verificationCode;
    @Column(name = "code_expired_at")
    private LocalDateTime expiredAt;

    private boolean isEnabled;
}

