package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Reference;

@Entity
@Table(name = "provinces")
@Data
public class Province {
    @Id
    @Column(length = 20)
    private String code;
    private String name;
    private String name_en;
    private String full_name;
    private String full_name_en;
    private String code_name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="administrative_unit_id", referencedColumnName = "id")
    private AdministrativeUnit administrativeUnit;
}
