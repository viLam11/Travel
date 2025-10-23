package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="administrative_units")
public class AdministrativeUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String full_name;
    private String full_name_en;
    private String short_name;
    private String short_name_en;
    private String code_name;
    private String code_name_en;
}
