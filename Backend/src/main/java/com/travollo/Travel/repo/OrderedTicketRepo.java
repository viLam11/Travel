package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Order;
import com.travollo.Travel.entity.OrderedTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderedTicketRepo extends JpaRepository<OrderedTicket, String> {
    List<OrderedTicket> findByOrder(Order order);
}
