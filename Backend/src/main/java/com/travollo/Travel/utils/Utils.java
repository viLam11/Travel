package com.travollo.Travel.utils;

import com.travollo.Travel.dto.CustomUserDetails;
import com.travollo.Travel.dto.UserDTO;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.repo.UserRepo;
import jakarta.persistence.Id;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class Utils {

    private static UserRepo userRepo;

    @Autowired
    public Utils(UserRepo userRepo) {
        Utils.userRepo = userRepo; // gán vào static field
    }

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
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setGender(user.getGender());
        userDTO.setCity(user.getCity());
        userDTO.setCountry(user.getCountry());
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
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setGender(user.getGender());
        userDTO.setCity(user.getCity());
        userDTO.setCountry(user.getCountry());
        userDTO.setRole(user.getRole());

        return userDTO;
    }

    public static UserDetails mapUserEntityToUserDetails(User user) {
        return new CustomUserDetails(user);
    }

    public static Optional<User> findUserByRequest(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user_email = authentication.getName();
        System.out.println("User gửi request này là: " + user_email);
        Optional<User> optionalUser = userRepo.findByEmail(user_email);
        return optionalUser;
    }

    public static Set<String> getEntityFields(Class<?> entityClass){
        return Arrays.stream(entityClass.getDeclaredFields())
                .map(Field::getName)
                .collect(Collectors.toSet());
    }

    public static String getIdFieldName(Class<?> clazz) {
        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(Id.class)) {
                return field.getName();
            }
        }
        throw new RuntimeException("No @Id field found in " + clazz.getSimpleName());
    }

}
