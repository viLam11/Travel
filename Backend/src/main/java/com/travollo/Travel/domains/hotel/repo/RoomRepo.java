package com.travollo.Travel.domains.hotel.repo;

import com.travollo.Travel.domains.hotel.entity.Hotel;
import com.travollo.Travel.domains.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepo extends JpaRepository<Room, String> {

    List<Room> findAllByHotel(Hotel hotel);
}
