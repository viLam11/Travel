package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
<<<<<<< HEAD
public interface OrderRepo extends JpaRepository<Order, Long> {
=======
public interface OrderRepo extends JpaRepository<Order, String> {
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
}
