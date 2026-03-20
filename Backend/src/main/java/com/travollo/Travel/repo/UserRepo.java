package com.travollo.Travel.repo;

import com.travollo.Travel.domains.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepo extends JpaRepository<User, String> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    List<User> findByUserIDIn(Set<String> userIds);
}
