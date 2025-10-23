package com.travollo.Travel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "imageservices")
public class ImageService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageID;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "serviceID")
    private TService tService;
}
