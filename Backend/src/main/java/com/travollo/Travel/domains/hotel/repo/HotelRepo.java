package com.travollo.Travel.domains.hotel.repo;

import com.travollo.Travel.domains.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelRepo extends JpaRepository<Hotel, String> {
}
