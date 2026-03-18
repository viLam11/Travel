package com.travollo.Travel.domains.travel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "imageservices")
public class ImageService {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String imageID;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    @JsonIgnore
    private TService tService;
}
