package com.travollo.Travel.domains.favorite.repo;

import com.travollo.Travel.domains.favorite.entity.FavoriteService;
import com.travollo.Travel.domains.travel.entity.TService;
import com.travollo.Travel.domains.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteServiceRepository extends JpaRepository<FavoriteService, String> {
    @EntityGraph(attributePaths = {"travelService"})
    Page<FavoriteService> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    boolean existsByUserAndTravelService(User user, TService travelService);

    Optional<FavoriteService> findByUserAndTravelService(User user, TService travelService);
}
