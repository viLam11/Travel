package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "blog")
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
