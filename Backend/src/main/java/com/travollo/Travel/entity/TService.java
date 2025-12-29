package com.travollo.Travel.entity;

import com.fasterxml.jackson.annotation.*;
import com.travollo.Travel.utils.ServiceType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "services")
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class TService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String serviceName;
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name="province_code", referencedColumnName = "code", columnDefinition = "varchar(20)")
    private Province province;

    private String address;
    private String contactNumber;
    private Long rating;
    private String tags;

    @Column(name = "thumbnail")
    private String thumbnailUrl;

    @Column(name = "average_price")
    private Long averagePrice;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(columnDefinition = "ENUM('HOTEL', 'RESTAURANT', 'TICKET_VENUE')")
=======
    @Column(columnDefinition = "ENUM('HOTEL', 'TICKET_VENUE')")
>>>>>>> 653a93b154bdf0dd944a24eef35527013d77664e
    private ServiceType serviceType;

    @Column(name = "min_price", nullable = false)
    private Long minPrice = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="provider_id", referencedColumnName = "userID")
    @JsonIgnore
    private User provider;

    @OneToMany(mappedBy = "tService", fetch = FetchType.EAGER,  cascade = CascadeType.ALL)
    @JsonIncludeProperties({"imageUrl", "description"})
    private List<ImageService> imageList;

    @OneToMany(mappedBy = "tService", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<CommentService> commentList;
}
