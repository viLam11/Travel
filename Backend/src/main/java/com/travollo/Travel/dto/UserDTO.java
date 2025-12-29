package com.travollo.Travel.dto;

import com.travollo.Travel.entity.Order;
import com.travollo.Travel.utils.Role;
import lombok.Data;

import java.util.List;

@Data
public class UserDTO {
    private Long userID;
    private String username;
    private String email;
    private String fullname;
    private String phone;

    private String address;
    private String dateOfBirth;
    private String gender;
    private String city;
    private String country;
    private Role role;

    private List<Order> orderList;

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setOrderList(List<Order> orderList) {
        this.orderList = orderList;
    }
    public List<Order> getOrderList() {
        return orderList;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
                "userID=" + userID +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", fullname='" + fullname + '\'' +
                ", phone='" + phone + '\'' +
                ", address='" + address + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
