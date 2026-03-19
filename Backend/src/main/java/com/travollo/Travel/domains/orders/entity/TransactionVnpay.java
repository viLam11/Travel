package com.travollo.Travel.domains.orders.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "vnpay_transactions")
@PrimaryKeyJoinColumn(name = "transaction_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TransactionVnpay extends Transaction {
    @Column(name = "vnp_txn_ref", unique = true, nullable = false)
    private String vnpTxnRef;

    @Column(name = "vnpay_create_date", nullable = false, length = 14)
    private String vnpayCreateDate;

    @Column(name = "vnp_order_info")
    private String vnpOrderInfo;

    @Column(name = "vnp_response_code", length = 2)
    private String vnpResponseCode;
}
