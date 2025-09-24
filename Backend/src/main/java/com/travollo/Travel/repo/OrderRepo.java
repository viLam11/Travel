package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Long> {
    List<Order> findByUser_UserID(Long userID);
    List<Order> findByService_ServiceID(Long serviceID);
    Optional<Order> findByOrderID(Long orderID);
}
