package com.travollo.Travel.domains.orders.service;

import com.travollo.Travel.domains.orders.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepo extends JpaRepository<Transaction, String> {
}
