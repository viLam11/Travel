package com.travollo.Travel.domains.hotel.service;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.hotel.dto.NewRoomRequest;
import com.travollo.Travel.domains.hotel.dto.RoomResponseDTO;
import com.travollo.Travel.domains.hotel.entity.RoomImage;
import com.travollo.Travel.domains.hotel.repo.HotelRepo;
import com.travollo.Travel.domains.hotel.repo.RoomImageRepo;
import com.travollo.Travel.domains.hotel.repo.RoomRepo;
import com.travollo.Travel.domains.hotel.entity.Hotel;
import com.travollo.Travel.domains.hotel.entity.Room;

import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.utils.Role;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelAndRoomService {
    private final HotelRepo hotelRepo;
    private final RoomRepo roomRepo;
    private final RoomImageRepo roomImageRepo;
    private final AwsS3Service awsS3Service;
    private final RoomMapper roomMapper;

    @Transactional
    public RoomResponseDTO createRoom(String hotelId, NewRoomRequest roomRequest) {
        Hotel hotel = hotelRepo.findById(hotelId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Hotel not found"));

        Room newRoom = Room.builder()
                .hotel(hotel)
                .type(roomRequest.getType())
                .price(roomRequest.getPrice())
                .quantity(roomRequest.getQuantity())
                .name(roomRequest.getName())
                .description(roomRequest.getDescription())
                .images(new ArrayList<>())
                .build();

        if (roomRequest.getImages() != null && !roomRequest.getImages().isEmpty()) {
            List<String> imageUrls = awsS3Service.saveImagesToS3(roomRequest.getImages());

            for (String url : imageUrls) {
                RoomImage roomImage = RoomImage.builder()
                        .url(url)
                        .room(newRoom) // Chiều 1: Ảnh trỏ về Phòng
                        .build();

                newRoom.getImages().add(roomImage); // Chiều 2: Phòng thêm Ảnh vào danh sách
            }
        }

        // Nhờ có CascadeType.ALL, Hibernate sẽ tự động gọi lệnh INSERT cho toàn bộ RoomImage bên trong list
        Room savedRoom = roomRepo.save(newRoom);

        return mapToRoomResponse(savedRoom);
    }

    @Transactional
    public RoomResponseDTO updateRoom(String roomID, NewRoomRequest updateRoomRequest) {
        Room existingRoom = roomRepo.findById(roomID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Room not found"));
        roomMapper.patchRequest(updateRoomRequest, existingRoom);
        return mapToRoomResponse(roomRepo.save(existingRoom));
    }

    public List<RoomResponseDTO> getAllRoomByHotelID(String hotelID) {
        Hotel hotel = hotelRepo.findById(hotelID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found Hotel"));
        return roomRepo.findAllByHotel(hotel).stream()
                .map(this::mapToRoomResponse)
                .toList();
    }

    @Transactional
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


    @Transactional
    public List<RoomImage> addImageToRoom(String roomID, List<MultipartFile> photos) {
        Room room = roomRepo.findById(roomID)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ID: " + roomID));
        List<String> urls = awsS3Service.saveImagesToS3(photos);
        List<RoomImage> savedImages = new ArrayList<>();
        for (String url : urls) {
            RoomImage newImg = RoomImage.builder()
                    .url(url)
                    .room(room)
                    .build();
            if (room.getImages() == null) {
                room.setImages(new ArrayList<>());
            }
            room.getImages().add(newImg);
            savedImages.add(newImg);
        }
        roomRepo.save(room);
        return roomImageRepo.saveAll(savedImages);
    }

    public List<RoomImage> getImagesByRoom(String roomID) {
        return roomImageRepo.findByRoom_RoomID(roomID);
    }

    @Transactional
    public void deleteImage(String imageId) {
        roomImageRepo.deleteById(imageId);
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
                .roomImgUrl(room.getRoomImgUrl())
                .images(room.getImages().stream().map(RoomImage::getUrl).toList())
                .build();
    }
}
