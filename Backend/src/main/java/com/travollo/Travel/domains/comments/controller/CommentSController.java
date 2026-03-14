package com.travollo.Travel.domains.comments.controller;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.comments.dto.CommentResponseDTO;
import com.travollo.Travel.domains.comments.dto.CreateCommentDTO;
import com.travollo.Travel.domains.comments.dto.UpdateCommentDTO;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.domains.comments.service.CommentSService;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentSController {
    private final CommentSService commentSService;

    @PostMapping("/{serviceID}")
    public ResponseEntity<CommentResponseDTO> postComment(
            @PathVariable String serviceID,
            @ModelAttribute CreateCommentDTO comment,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(commentSService.addComment(serviceID, comment, currentUser));
    }

    @GetMapping("/{serviceID}")
    public ResponseEntity<PageResponse<CommentResponseDTO>> getCommentsByServiceID(
            @PathVariable String serviceID,
            @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(name = "size", required = false, defaultValue = "10") Integer size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction
    ) {
        return ResponseEntity.ok(commentSService.getCommentsByServiceID(serviceID, page, size, sortBy, direction));
    }

    @GetMapping("/{serviceID}/all")
    public ResponseEntity<List<CommentResponseDTO>> getAllComments(@PathVariable String serviceID) {
        return ResponseEntity.ok(commentSService.getAllCommentsByService(serviceID));
    }

    @PatchMapping("/{commentID}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable String commentID,
            @RequestBody UpdateCommentDTO updateCommentDTO,
            @CurrentUser User currentUser
            ) {
        return ResponseEntity.ok(commentSService.updateComment(commentID, updateCommentDTO, currentUser));
    }

    @DeleteMapping("/{commentID}")
    public ResponseEntity<String> deleteComment(
            @PathVariable String commentID,
            @CurrentUser User currenuser) {
        commentSService.deleteComment(commentID, currenuser);
        return ResponseEntity.ok("Delete successfully");
    }

    @PostMapping("/like/{commentID}")
    ResponseEntity<Object> likeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return  ResponseEntity.ok(commentSService.likeComment(currentUser, commentID));
    }

    @PostMapping("/unlike/{commentID}")
    ResponseEntity<Object> unlikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok( commentSService.unlikeComment(currentUser, commentID));
    }

    @PostMapping("/dislike/{commentID}")
    ResponseEntity<Object> dislikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return  ResponseEntity.ok(commentSService.dislikeComment(currentUser, commentID));
    }
//
//    @PostMapping("/undoDislike/{commentID}")
//    ResponseEntity<Object> undoDislike(
//            @PathVariable String commentID,
//            @CurrentUser User currentUser
//    ) {
//        return commentSService.undoDislikeComment(currentUser, commentID);
//    }
//
//    @PatchMapping(
//            value = "/{serviceID}",
//            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
//    )
//    ResponseEntity<Object> updateComment() {
//        return null;
//    }

//    @GetMapping("/{serviceID}")
//    ResponseEntity<List<CommentResponseDTO>> getAllComments(@PathVariable String serviceID) {
//
//    }

//    @GetMapping("/{serviceID}")
//    ResponseEntity<Object> getAllCommentByServiceID(
//            @PathVariable String serviceID,
//            @RequestParam(name = "page", required = false) Integer page,
//            @RequestParam(name = "size", required = false) Integer size,
//            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
//            @RequestParam(name = "direction", defaultValue = "desc") String direction
//    ) {
//        return commentSService.getCommentsByServiceID(serviceID,page,size,sortBy,direction);
//    }
}
