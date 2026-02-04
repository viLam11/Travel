package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, String> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Page<Order> findByUser(User user, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.orderedTickets " +
            "LEFT JOIN FETCH o.orderedRooms " +
            "WHERE o.user = :user")
    Page<Order> findAllByUserWithDetails(@Param("user") User user, Pageable pageable);
}
