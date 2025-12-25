package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Time;
import java.util.List;

@Data
@Entity
@Table(name = "restaurants")
public class Restaurant extends TService {
    private Time openTime;
    private Time closeTime;
    private String workingDays;
    private String cuisineType;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> memnuList;
}