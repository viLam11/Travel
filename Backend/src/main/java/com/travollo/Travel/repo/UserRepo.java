package com.travollo.Travel.repo;

import com.travollo.Travel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
<<<<<<< HEAD
    boolean existsByUsername(String username);
=======
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u")
    List<User> findAll();
}
