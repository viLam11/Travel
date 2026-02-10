package com.travollo.Travel.service.impl;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.dto.comment.UpdateCommentDTO;
import com.travollo.Travel.entity.*;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.repo.*;
import com.travollo.Travel.service.AwsS3Service;
import com.travollo.Travel.service.interfac.CommentServiceInterface;
import com.travollo.Travel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class CommentSService implements CommentServiceInterface {

    @Autowired
    ServiceRepo serviceRepo;

    @Autowired
    CommentServiceRepo commentServiceRepo;

    @Autowired
    CommentImgRepo commentImgRepo;

    @Autowired
    CommentSLikeRepo commentSLikeRepo;

    @Autowired
    CommentSDislikeRepo commentSDislikeRepo;

    @Autowired
    AwsS3Service awsS3Service;

    public ResponseEntity<Object> addComment(CreateCommentDTO newCmtDTO, User user){
        System.out.println("new Comment: " + newCmtDTO);
        System.out.println("user: " + user.toString());

        // find User

        // check requirements: User ordered this service

        // Add comment
        CommentService newCmt = new CommentService();
        newCmt.setContent(newCmtDTO.getContent());
        newCmt.setRating(newCmtDTO.getRating());
        newCmt.setUser(user);
        newCmt.setCreatedAt(LocalDateTime.now());

        TService service = serviceRepo.findById(newCmtDTO.getServiceID()).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Service isn't exist."));
        newCmt.setTService(service);
        CommentService savedCmt = commentServiceRepo.save(newCmt);

        // Upload images
        List<CommentImg> imgList = new ArrayList<>();
        List<String> imageList = awsS3Service.saveImagesToS3(newCmtDTO.getPhotos());
        for (String url: imageList) {
            CommentImg newImg = new CommentImg();
            newImg.setImageUrl(url);
            newImg.setDescription("Image " + url + " of service " + service.getServiceName());
            imgList.add(newImg);
        }
        commentImgRepo.saveAll(imgList);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCmt);
    }

    public ResponseEntity<Object> updateComment(UpdateCommentDTO updatedCmt, User user) {
        if (updatedCmt.getId() == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "commentID is required");
        }
        CommentService comment = commentServiceRepo.findById(updatedCmt.getId())
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST ,"Not found comment"));
        if (!comment.getUser().getUserID().equals(user.getUserID())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "User has no authorization to delete comment.");
        }
        if (updatedCmt.getContent() != null){
            comment.setContent(updatedCmt.getContent());
        }
        if (updatedCmt.getRating() != null) {
            comment.setRating(updatedCmt.getRating());
        }
        // xóa hết ảnh cũ, đổi lại ảnh mới
        if (updatedCmt.getPhotos() != null && !updatedCmt.getPhotos().isEmpty()) {
            // delete imgs by serviceID
            commentImgRepo.deleteAllImgByServiceID(comment.getTService().getId());

            //  save new images
            List<CommentImg> imgList = new ArrayList<>();
            List<String> imageList = awsS3Service.saveImagesToS3(updatedCmt.getPhotos());
            for (String url: imageList) {
                CommentImg newImg = new CommentImg();
                newImg.setImageUrl(url);
                newImg.setDescription("Image " + url + " of service " + comment.getTService().getServiceName());
            }
            commentImgRepo.saveAll(imgList);
        }

        return null;
    }

    public ResponseEntity<Object> getCommentsByServiceID(String serviceID, Integer page, Integer size, String sortBy, String direction) {
        TService service = serviceRepo.findById(serviceID)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (page == null || size == null) {
            int totalComments = commentServiceRepo.countByServiceID(serviceID);
            Pageable pageable = PageRequest.of(0, totalComments);

            Page<CommentService> pageData = commentServiceRepo.findAllByTService(service, pageable);
            return ResponseEntity.ok(pageData);
        }
        Set<String> validFields = Utils.getEntityFields(CommentService.class);

        if (!validFields.contains(sortBy)) {
            sortBy = Utils.getIdFieldName(CommentService.class);
        }
        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CommentService> pageData = commentServiceRepo.findAllByTService(service, pageable);
        return ResponseEntity.ok(pageData);
    }

    public ResponseEntity<Object> getCommentById(String commentID){
        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "COMMENT NOT FOUND"));
        return ResponseEntity.ok(comment);
    }

    public ResponseEntity<Object> likeComment(User user, String commentID){
        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found comment"));
        System.out.println("USER: "  + user.toString());
        System.out.println("Comment: " + comment.toString());

        boolean existLike = commentSLikeRepo.existLike(user, comment);
        if (existLike) {
            return ResponseEntity.ok("User had liked this comment");
        }
        CommentLike newRecord = new CommentLike();
        newRecord.setUser(user);
        newRecord.setComment(comment);
        commentSLikeRepo.save(newRecord);
        return ResponseEntity.ok("ok");
    }

    public ResponseEntity<Object> unlikeComment(User user, String commentID){
        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found comment"));
        boolean existLike = commentSLikeRepo.existLike(user, comment);
        if (!existLike) {
            return ResponseEntity.ok("User hadn't liked this comment");
        }
        CommentLike commentLike = commentSLikeRepo.findByUserAndComment(user, comment).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found data"));
        commentSLikeRepo.delete(commentLike);
        return ResponseEntity.ok("Successfully delete the comment");
    }

    public ResponseEntity<Object> dislikeComment(User user, String commentID) {
        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found comment"));
        boolean existDislike = commentSDislikeRepo.existByUserAndComment(user, comment);
        if (existDislike) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User had disliked this comment");
        }
        CommentDislike newRecord = new CommentDislike();
        newRecord.setComment(comment);
        newRecord.setUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("Have ");
    }

    public ResponseEntity<Object> undoDislikeComment(User user, String commentID) {
        CommentService comment = commentServiceRepo.findById(commentID).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found comment"));
        boolean existDislike = commentSDislikeRepo.existByUserAndComment(user, comment);
        if (!existDislike) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User hadn't disliked this comment");
        }
        Long count = commentSDislikeRepo.deleteByUserAndComment(user, comment);
        return ResponseEntity.status(HttpStatus.OK).body("Delete " + count + "comment");
    }


}
