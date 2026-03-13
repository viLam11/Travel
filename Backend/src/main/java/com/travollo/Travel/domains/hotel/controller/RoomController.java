package com.travollo.Travel.domains.hotel.controller;

import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.domains.hotel.dto.RoomResponseDTO;
import com.travollo.Travel.domains.hotel.service.HotelAndRoomService;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rooms")
public class RoomController {
    private HotelAndRoomService hotelAndRoomService;

    @PatchMapping("/{roomID}")
    ResponseEntity<RoomResponseDTO> updateRoom(
            @PathVariable String roomID,
            @ModelAttribute NewRoomRequest updateRoomRequest
    ) {
        return ResponseEntity.ok(hotelAndRoomService.updateRoom(roomID, updateRoomRequest));
    }

    @GetMapping("/{roomID}")
    ResponseEntity<RoomResponseDTO> getRoom(
            @PathVariable String roomID
    ) {
        return ResponseEntity.ok(hotelAndRoomService.getRoomById(roomID));
    }

    @DeleteMapping("/{roomID}")
    ResponseEntity<Object> deleteRoom(
        @PathVariable String roomID,
        @CurrentUser User currentUser
    ) {
        hotelAndRoomService.deleteRoom(roomID, currentUser);
        return ResponseEntity.ok("Delete successfully!");
    }

}
