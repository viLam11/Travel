package com.travollo.Travel.entity;

import com.travollo.Travel.utils.ServiceType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "services")
@Inheritance(strategy = InheritanceType.JOINED)
public class TService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String serviceName;
    private String description;

    @ManyToOne
    @JoinColumn(name="province_code", referencedColumnName = "code")
    private Province province;

    private String address;
    private String contactNumber;
    private Long rating;
    private String tags;

    @Column(name = "average_price")
    private Long averagePrice;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('HOTEL', 'RESTAURANT', 'TICKET_VENUE')")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="provider_id", referencedColumnName = "userID")
    private User provider;

    @OneToMany(mappedBy = "tService", fetch = FetchType.LAZY)
    private List<ImageService> imageList;
}
