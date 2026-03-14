package com.travollo.Travel.domains.favorite.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FavoriteResponseDTO {
    private String favoriteId;
    private String serviceId;
    private String serviceName;
    private String thumbnailUrl;
    private Long averagePrice;
    private Long rating;
    private LocalDateTime favoriteAt;
}
