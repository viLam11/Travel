package com.travollo.Travel.utils;

import com.travollo.Travel.dto.CustomUserDetails;
import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.SecureRandom;

public class Utils {
    private static final String ALPHANUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static SecureRandom secureRandom = new SecureRandom();

    public static String generateRandomAlphamnumeric(int length) {
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(ALPHANUMERIC_STRING.length());
            char randomChar = ALPHANUMERIC_STRING.charAt(randomIndex);
            stringBuilder.append(randomChar);
        }
        return stringBuilder.toString();
    }

    public static UserDTO mapUserEntityToDTO(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setUserID(user.getUserID());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullname(user.getFullname());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setRole(user.getRole());

        return userDTO;
    }


    public static UserDTO mapUserEntityToUserDTOPlusUserOrder(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setUserID(user.getUserID());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullname(user.getFullname());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setRole(user.getRole());

        return userDTO;
    }

    public static UserDetails mapUserEntityToUserDetails(User user) {
        return new CustomUserDetails(user);
    }
}
