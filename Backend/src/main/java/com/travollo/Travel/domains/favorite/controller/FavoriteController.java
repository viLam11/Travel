package com.travollo.Travel.domains.favorite.controller;

import com.travollo.Travel.domains.favorite.dto.FavoriteResponseDTO;
import com.travollo.Travel.domains.favorite.service.FavoriteLogicService;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteLogicService favoriteLogicService;

    @PostMapping("/{serviceId}")
    public ResponseEntity<Void> addFavorite(
            @CurrentUser User currentUser,
            @PathVariable String serviceId) {
        favoriteLogicService.addFavorite(currentUser, serviceId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> removeFavorite(
            @CurrentUser User currentUser,
            @PathVariable String serviceId) {
        favoriteLogicService.removeFavorite(currentUser, serviceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<FavoriteResponseDTO>> getMyFavorites(
            @CurrentUser User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<FavoriteResponseDTO> result = favoriteLogicService.getUserFavorites(currentUser, page, size);
        return ResponseEntity.ok(result);
    }
}
