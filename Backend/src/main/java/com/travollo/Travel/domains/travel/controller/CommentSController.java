package com.travollo.Travel.domains.travel.controller;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.entity.User;
import com.travollo.Travel.exception.CustomException;
import com.travollo.Travel.service.impl.CommentSService;
import com.travollo.Travel.utils.CurrentUser;
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

    @PostMapping("")
    ResponseEntity<Object> postComment(
            @PathVariable Long serviceID,
            @ModelAttribute CreateCommentDTO comment,
            @CurrentUser User currentUser
    ) {
        return commentSService.addComment(comment, currentUser);
    }

    @PostMapping("/like/{commentID}")
    ResponseEntity<Object> likeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return commentSService.likeComment(currentUser, commentID);
    }

    @PostMapping("/unlike/{commentID}")
    ResponseEntity<Object> unlikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return commentSService.unlikeComment(currentUser, commentID);
    }

    @PostMapping("/dislike/{commentID}")
    ResponseEntity<Object> dislikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return commentSService.dislikeComment(currentUser, commentID);
    }

    @PostMapping("/undoDislike/{commentID}")
    ResponseEntity<Object> undoDislike(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return commentSService.undoDislikeComment(currentUser, commentID);
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
            @PathVariable String serviceID,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction
    ) {
        return commentSService.getCommentsByServiceID(serviceID,page,size,sortBy,direction);
    }

    @DeleteMapping("/{commentID}")
    ResponseEntity<Object> deleteComment() {
        return null;
    }

}
