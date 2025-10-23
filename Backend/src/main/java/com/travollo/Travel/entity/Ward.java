package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "wards")
@Data
public class Ward {
    @Id
    @Column(length = 225)
    private String code;
    private String name;
    private String name_en;
    private String code_name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="province_code", referencedColumnName = "code")
    private Province province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="administrative_unit_id", referencedColumnName = "id")
    private AdministrativeUnit administrativeUnit;
}
