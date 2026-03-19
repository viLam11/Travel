package com.travollo.Travel.domains.orders.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "momo_transactions")
@PrimaryKeyJoinColumn(name = "transaction_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TransactionMomo extends Transaction{
    @Column(name = "momo_order_id", unique = true, nullable = false)
    private String momoOrderId;

    @Column(name = "momo_request_id", nullable = false)
    private String momoRequestId;

    @Column(name = "request_type")
    private String requestType;

    @Column(name = "momo_error_code")
    private Integer errorCode;
}
