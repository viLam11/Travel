package com.travollo.Travel.domains.favorite.service;


import com.travollo.Travel.domains.favorite.dto.FavoriteResponseDTO;
import com.travollo.Travel.domains.favorite.entity.FavoriteService;
import com.travollo.Travel.domains.favorite.repo.FavoriteServiceRepository;
import com.travollo.Travel.entity.TService;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.repo.ServiceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteLogicService {
    private final FavoriteServiceRepository favoriteRepository;
    private final ServiceRepo serviceRepo;

    @Transactional
    public void addFavorite(User user, String serviceId) {
        TService service = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ"));

        if (favoriteRepository.existsByUserAndTravelService(user, service)) {
            return;
        }

        FavoriteService favorite = FavoriteService.builder()
                .user(user)
                .travelService(service)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(User user, String serviceId) {
        TService service = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ"));

        FavoriteService favorite = favoriteRepository.findByUserAndTravelService(user, service)
                .orElseThrow(() -> new RuntimeException("Dịch vụ này chưa có trong danh sách yêu thích"));

        favoriteRepository.delete(favorite);
    }

    public Page<FavoriteResponseDTO> getUserFavorites(User user, int page, int size) {
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size))
                .map(fav -> FavoriteResponseDTO.builder()
                        .favoriteId(fav.getId())
                        .serviceId(fav.getTravelService().getId())
                        .serviceName(fav.getTravelService().getServiceName())
                        .thumbnailUrl(fav.getTravelService().getThumbnailUrl())
                        .averagePrice(fav.getTravelService().getAveragePrice())
                        .rating(fav.getTravelService().getRating())
                        .favoriteAt(fav.getCreatedAt())
                        .build());
    }
}
