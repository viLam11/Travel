package com.travollo.Travel.domains.hotel.service;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.domains.hotel.dto.RoomResponseDTO;
import com.travollo.Travel.domains.hotel.repo.HotelRepo;
import com.travollo.Travel.domains.hotel.repo.RoomRepo;
import com.travollo.Travel.entity.Hotel;
import com.travollo.Travel.entity.Room;

import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.utils.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelAndRoomService {
    private final HotelRepo hotelRepo;
    private final RoomRepo roomRepo;
    private final AwsS3Service awsS3Service;
    private final RoomMapper roomMapper;

    public RoomResponseDTO createRoom(String hotelId, NewRoomRequest roomRequest) {
        Hotel hotel = hotelRepo.findById(hotelId).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Hotel not found"));

        String imageUrl = awsS3Service.saveImageToS3(roomRequest.getRoomImage());
        Room newRoom = Room.builder()
                .hotel(hotel)
                .type(roomRequest.getType())
                .price(roomRequest.getPrice())
                .quantity(roomRequest.getQuantity())
                .roomImgUrl(imageUrl)
                .build();
        Room savedRoom = roomRepo.save(newRoom);

        return mapToRoomResponse(savedRoom);
    }

    public RoomResponseDTO updateRoom(String roomID, NewRoomRequest updateRoomRequest) {
        Room existingRoom = roomRepo.findById(roomID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Room not found"));
        roomMapper.patchRequest(updateRoomRequest, existingRoom);
        Room updatedRoom = roomRepo.save(existingRoom);
        return mapToRoomResponse(updatedRoom);
    }

    public List<RoomResponseDTO> getAllRoomByHotelID(String hotelID) {
        Hotel hotel = hotelRepo.findById(hotelID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found Hotel"));
        List<Room> roomList = roomRepo.findAllByHotel(hotel);

        return roomList.stream()
                .map(this::mapToRoomResponse)
                .toList();
    }

    public void deleteRoom(String roomID, User currentUser) {
        Room room = roomRepo.findById(roomID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found room"));

        if (currentUser.getRole() != Role.ADMIN
            && !currentUser.getUserID().equals(room.getHotel().getProvider().getUserID())
        ) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Denied permission to delete this room");
        }

        roomRepo.deleteById(roomID);
    }

    public RoomResponseDTO getRoomById(String roomID) {
        return mapToRoomResponse(roomRepo.findById(roomID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Room not found")));
    }

    public PageResponse<RoomResponseDTO> getAllRooms(int pageNo, int pageSize) {
        Pageable pageable = Pageable.ofSize(pageSize).withPage(pageNo);
        Page<RoomResponseDTO> roomPage = roomRepo.findAll(pageable).map(this::mapToRoomResponse);
        return new PageResponse<>(
               roomPage.getContent(),
                roomPage.getNumber(),
                roomPage.getSize(),
                roomPage.getTotalElements(),
                roomPage.getTotalPages(),
                roomPage.isLast()
        );
    }

    /** Helper functions map Room entity -> Room Response
     * */
    private RoomResponseDTO mapToRoomResponse(Room room) {
        return RoomResponseDTO.builder()
                .id(room.getRoomID())
                .hotelId(room.getHotel().getId())
                .type(room.getType())
                .price(room.getPrice())
                .quantity(room.getQuantity())
                .imageUrl(room.getRoomImgUrl())
                .build();
    }


}
