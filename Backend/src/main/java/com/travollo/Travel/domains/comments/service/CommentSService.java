package com.travollo.Travel.domains.comments.service;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.comments.dto.CommentResponseDTO;
import com.travollo.Travel.domains.comments.dto.UpdateCommentDTO;
import com.travollo.Travel.domains.comments.repo.CommentImgRepo;
import com.travollo.Travel.domains.comments.repo.CommentSDislikeRepo;
import com.travollo.Travel.domains.comments.repo.CommentSLikeRepo;
import com.travollo.Travel.domains.comments.repo.CommentServiceRepo;
import com.travollo.Travel.domains.comments.dto.CreateCommentDTO;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.*;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.utils.Role;
import com.travollo.Travel.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CommentSService {
    private final ServiceRepo serviceRepo;
    private final CommentServiceRepo commentServiceRepo;
    private final CommentImgRepo commentImgRepo;
    private final CommentSLikeRepo commentSLikeRepo;
    private final CommentSDislikeRepo commentSDislikeRepo;
    private final UserRepo userRepo;
    private final CommentMapper commentMapper;

    private final AwsS3Service awsS3Service;

    public List<CommentResponseDTO> getAllCommentsByService(
            String serviceID
    ) {
        return commentServiceRepo.findAllByServiceId(serviceID).stream()
                .map(this::mapToCommentResponse)
                .toList();
    }
    @Transactional
    public CommentResponseDTO addComment(String serviceID, CreateCommentDTO newCmtDTO, User user) {
        TService service = serviceRepo.findById(serviceID)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Service doesn't exist."));
        Comment newCmt = Comment.builder()
                .content(newCmtDTO.getContent())
                .rating(newCmtDTO.getRating())
                .user(user)
                .travelService(service)
                .createdAt(LocalDateTime.now())
                .imageList(new ArrayList<>())
                .build();

        Comment savedCmt = commentServiceRepo.save(newCmt);

        if (newCmtDTO.getPhotos() != null && !newCmtDTO.getPhotos().isEmpty()) {
            List<String> imageUrls = awsS3Service.saveImagesToS3(newCmtDTO.getPhotos());
            List<CommentImg> imgEntities = imageUrls.stream().map(url -> {
                CommentImg img = new CommentImg();
                img.setImageUrl(url);
                img.setDescription("Image of service " + service.getServiceName());
                img.setComment(savedCmt);
                return img;
            }).toList();

            commentImgRepo.saveAll(imgEntities);
            savedCmt.setImageList(imgEntities);
        }

        return mapToCommentResponse(savedCmt);
    }

    @Transactional
    public CommentResponseDTO updateComment(
            String commentID,
            UpdateCommentDTO updateCommentDTO,
            User currentUser
    ) {
        Comment existingCmt = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        commentMapper.patchComment(updateCommentDTO, existingCmt);
        if (updateCommentDTO.getImageList() != null) {
            commentImgRepo.deleteAllByComment(existingCmt);
            List<CommentImg> newImages = new ArrayList<>();
            List<String> uploadedUrls = awsS3Service.saveImagesToS3(updateCommentDTO.getImageList());
            for (String url : uploadedUrls) {
                CommentImg img = CommentImg.builder()
                        .imageUrl(url)
                        .comment(existingCmt)
                        .build();
                newImages.add(img);
            }
            commentImgRepo.saveAll(newImages);
            existingCmt.setImageList(newImages);
        }
        return mapToCommentResponse(commentServiceRepo.save(existingCmt));
    }

    public PageResponse<CommentResponseDTO> getCommentsByServiceID(String serviceID, Integer page, Integer size, String sortBy, String direction) {
        TService service = serviceRepo.findById(serviceID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found Service"));

        int pageNo = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 10;

        Set<String> validFields = Utils.getEntityFields(Comment.class);
        String finalSortBy = (sortBy != null && validFields.contains(sortBy)) ? sortBy : Utils.getIdFieldName(Comment.class);

        Sort sort = "desc".equalsIgnoreCase(direction) ?
                Sort.by(finalSortBy).descending() :
                Sort.by(finalSortBy).ascending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Comment> pageData = commentServiceRepo.findAllByTravelService(service, pageable);

        return PageResponse.<CommentResponseDTO>builder()
                .content(pageData.getContent().stream().map(this::mapToCommentResponse).toList())
                .pageNo(pageData.getNumber())
                .pageSize(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    public CommentResponseDTO getCommentById(String commentID) {
        return mapToCommentResponse(commentServiceRepo.findById(commentID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận")));
    }

    @Transactional
    public void deleteComment(String commentID, User requestingUser) {
        Comment existingComment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        if (requestingUser.getRole() != Role.ADMIN && !requestingUser.getUserID().equals(existingComment.getUser().getUserID())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "User don't have permission to delete comment");
        }
        commentServiceRepo.delete(existingComment);
    }


    @Transactional
    public CommentResponseDTO likeComment(User user, String commentID){
        Comment comment = commentServiceRepo.findById(commentID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        boolean existLike = commentSLikeRepo.existLike(user, comment);
        if (existLike) {
            throw new CustomException(HttpStatus.FORBIDDEN, "User had liked this comment");
        }
        CommentLike newRecord = new CommentLike();
        newRecord.setUser(user);
        newRecord.setComment(comment);
        commentSLikeRepo.save(newRecord);
        int currentLikes = comment.getLikes();
        comment.setLikes(currentLikes + 1);
        commentServiceRepo.save(comment);
        return mapToCommentResponse(comment);
    }

    @Transactional
    public CommentResponseDTO unlikeComment(User user, String commentID) {
        Comment comment = commentServiceRepo.findById(commentID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        CommentLike commentLike = commentSLikeRepo.findByUserAndComment(user, comment)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "User hasn't liked this comment yet"));
        commentSLikeRepo.delete(commentLike);
        int currentLikes = comment.getLikes() ;
        comment.setLikes(Math.max(0, currentLikes - 1));
        commentServiceRepo.save(comment);
        return mapToCommentResponse(comment);
    }

    @Transactional
    public CommentResponseDTO dislikeComment(User user, String commentID) {
        Comment comment = commentServiceRepo.findById(commentID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        boolean existDislike = commentSDislikeRepo.existByUserAndComment(user, comment);
        if (existDislike) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "User had disliked this comment");
        }
        CommentDislike newRecord = new CommentDislike();
        newRecord.setComment(comment);
        newRecord.setUser(user);
        commentSDislikeRepo.save(newRecord);
        int currentDislikes =comment.getDislikes();
        comment.setDislikes(currentDislikes + 1);
        commentServiceRepo.save(comment);
        return mapToCommentResponse(comment);
    }

    @Transactional
    public CommentResponseDTO undoDislikeComment(User user, String commentID) {
        Comment comment = commentServiceRepo.findById(commentID)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Not found comment"));
        CommentDislike commentDislike = commentSDislikeRepo.findByUserAndComment(user, comment)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "User hasn't disliked this comment yet"));
        commentSDislikeRepo.delete(commentDislike);
        int currentDislikes = comment.getDislikes();
        comment.setDislikes(Math.max(0, currentDislikes - 1));
        commentServiceRepo.save(comment);
        return mapToCommentResponse(comment);
    }

    /** Helper functions map CommentService entity -> CommentResponseDTO
     * */
    private CommentResponseDTO mapToCommentResponse(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .likes(comment.getLikes())
                .dislikes(comment.getDislikes())
                .content(comment.getContent())
                .rating(comment.getRating())
                .createdAt(comment.getCreatedAt())
                .serviceName(comment.getTravelService().getServiceName())
                .serviceID(comment.getTravelService().getServiceName())
                .userID(comment.getUser().getUserID())
                .username(comment.getUser().getUsername())
                .imageList(comment.getImageList().stream()
                        .map(CommentImg::getImageUrl)
                        .toList())
                .build();
    }

//    public ResponseEntity<Object> updateComment(UpdateCommentDTO updatedCmt, User user) {
//        if (updatedCmt.getId() == null) {
//            throw new CustomException(HttpStatus.BAD_REQUEST, "commentID is required");
//        }
//        CommentService comment = commentServiceRepo.findById(updatedCmt.getId())
//                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST ,"Not found comment"));
//        if (!comment.getUser().getUserID().equals(user.getUserID())) {
//            throw new CustomException(HttpStatus.BAD_REQUEST, "User has no authorization to delete comment.");
//        }
//        if (updatedCmt.getContent() != null){
//            comment.setContent(updatedCmt.getContent());
//        }
//        if (updatedCmt.getRating() != null) {
//            comment.setRating(updatedCmt.getRating());
//        }
//        // xóa hết ảnh cũ, đổi lại ảnh mới
//        if (updatedCmt.getPhotos() != null && !updatedCmt.getPhotos().isEmpty()) {
//            // delete imgs by serviceID
//            commentImgRepo.deleteAllImgByServiceID(comment.getTService().getId());
//
//            //  save new images
//            List<CommentImg> imgList = new ArrayList<>();
//            List<String> imageList = awsS3Service.saveImagesToS3(updatedCmt.getPhotos());
//            for (String url: imageList) {
//                CommentImg newImg = new CommentImg();
//                newImg.setImageUrl(url);
//                newImg.setDescription("Image " + url + " of service " + comment.getTService().getServiceName());
//            }
//            commentImgRepo.saveAll(imgList);
//        }
//
//        return null;
//    }
//
//    public ResponseEntity<Object> getCommentsByServiceID(String serviceID, Integer page, Integer size, String sortBy, String direction) {
//        TService service = serviceRepo.findById(serviceID)
//                .orElseThrow(() -> new RuntimeException("Service not found"));
//        if (page == null) page = 0;
//        if (size == null) size = 10;
//        if (page == null || size == null) {
//            int totalComments = commentServiceRepo.countByServiceID(serviceID);
//            Pageable pageable = PageRequest.of(0, totalComments);
//
//            Page<CommentService> pageData = commentServiceRepo.findAllByTService(service, pageable);
//            return ResponseEntity.ok(pageData);
//        }
//        Set<String> validFields = Utils.getEntityFields(CommentService.class);
//
//        if (!validFields.contains(sortBy)) {
//            sortBy = Utils.getIdFieldName(CommentService.class);
//        }
//        Sort sort = direction.equalsIgnoreCase("desc") ?
//                Sort.by(sortBy).descending() :
//                Sort.by(sortBy).ascending();
//        Pageable pageable = PageRequest.of(page, size, sort);
//
//        Page<CommentService> pageData = commentServiceRepo.findAllByTService(service, pageable);
//        return ResponseEntity.ok(pageData);
//    }
//
//    public ResponseEntity<Object> getCommentById(String commentID){
//        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "COMMENT NOT FOUND"));
//        return ResponseEntity.ok(comment);
//    }


}
