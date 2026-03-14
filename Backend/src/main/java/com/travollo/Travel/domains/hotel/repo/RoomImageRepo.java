package com.travollo.Travel.domains.hotel.repo;

import com.travollo.Travel.domains.hotel.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomImageRepo extends JpaRepository<RoomImage, String> {
    List<RoomImage> findByRoom_RoomID(String roomID);
}
