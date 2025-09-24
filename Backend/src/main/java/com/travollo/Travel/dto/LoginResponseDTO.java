package com.travollo.Travel.dto;

import com.travollo.Travel.utils.Role;

public class LoginResponseDTO {
    private String token;
    private UserDTO user;
    private Role role;

    public LoginResponseDTO(String token, UserDTO user, Role role) {
        this.token = token;
        this.user = user;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
}
