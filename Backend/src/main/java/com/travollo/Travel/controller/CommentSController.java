package com.travollo.Travel.controller;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.service.impl.CommentSService;
import com.travollo.Travel.utils.Utils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/comment")
public class CommentSController {
    @Autowired
    CommentSService commentSService;

    @PostMapping(
            value = "/{serviceID}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<Object> postComment(
            @PathVariable Long serviceID,
            @ModelAttribute CreateCommentDTO comment,
            HttpServletRequest request
    ) {
        Optional<User> customer = Utils.findUserByRequest(request);
        if (customer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }
        return commentSService.addComment(comment, customer.get());
    }

    @PostMapping("/like/{commentID}")
    ResponseEntity<Object> likeComment(
            HttpServletRequest request,
            @PathVariable Long commentID
    ) {
        User user = Utils.findUserByRequest(request).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found user"));
        return commentSService.likeComment(user, commentID);
    }

    @PostMapping("/unlike/{commentID}")
    ResponseEntity<Object> unlikeComment(
            HttpServletRequest request,
            @PathVariable Long commentID
    ) {
        User user = Utils.findUserByRequest(request).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found user"));
        return commentSService.unlikeComment(user, commentID);
    }

    @PostMapping("/dislike/{commentID}")
    ResponseEntity<Object> dislikeComment(
            HttpServletRequest request,
            @PathVariable Long commentID
    ) {
        User user = Utils.findUserByRequest(request).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found user"));
        return commentSService.dislikeComment(user, commentID);
    }

    @PostMapping("/undoDislike/{commentID}")
    ResponseEntity<Object> undoDislike(
            HttpServletRequest request,
            @PathVariable Long commentID
    ) {
        User user = Utils.findUserByRequest(request).orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Not found user"));
        return commentSService.undoDislikeComment(user, commentID);
    }

    @PatchMapping(
            value = "/{serviceID}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<Object> updateComment() {
        return null;
    }

    @GetMapping("/{serviceID}")
    ResponseEntity<Object> getAllCommentByServiceID(
            @PathVariable Long serviceID,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction
    ) {
        return commentSService.getCommentsByServiceID(serviceID,page,size,sortBy,direction);
    }

    @GetMapping("/{commentID}")
    ResponseEntity<Object> getCommentById(
        @PathVariable Long commentID
    ){
        return null;
    }

    @DeleteMapping("/{commentID}")
    ResponseEntity<Object> deleteComment() {
        return null;
    }

}
