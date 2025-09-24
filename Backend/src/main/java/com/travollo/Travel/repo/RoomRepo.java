package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomRepo extends JpaRepository<Room, Long> {
    @Query("SELECT DISTINCT r.type FROM Room r")
    List<String> findDistinctRoomType();

    @Query("SELECT r FROM Room r WHERE r.service.serviceID = :serviceID AND r.quantity > 0")
    List<Room> getAvailableRooms(Long serviceID);
}
