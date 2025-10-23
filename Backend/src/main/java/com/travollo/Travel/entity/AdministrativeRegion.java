package com.travollo.Travel.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "administrative_regions")
public class AdministrativeRegion {
    @Id
    private Long id;
    private String name;
    private String name_en;
    private String code_name_en;
}
