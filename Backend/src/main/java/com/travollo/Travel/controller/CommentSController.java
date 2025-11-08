package com.travollo.Travel.controller;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.entity.User;
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

    @GetMapping("/like/{commentID}")
    ResponseEntity<Object> likeComment() {
        return null;
    }

    @GetMapping("/dislike/{commentID}")
    ResponseEntity<Object> dislikeComment() {
        return null;
    }

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

    @PatchMapping(
            value = "/{serviceID}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<Object> updateComment() {
        return null;
    }

    @DeleteMapping("/{commentID}")
    ResponseEntity<Object> deleteComment() {
        return null;
    }

}
