package com.travollo.Travel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Reference;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="administrative_unit_id", referencedColumnName = "id")
    @JsonIgnore
    private AdministrativeUnit administrativeUnit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "administrative_region_id")
    private AdministrativeRegion administrativeRegion;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
