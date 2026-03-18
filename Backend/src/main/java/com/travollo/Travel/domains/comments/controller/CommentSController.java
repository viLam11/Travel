package com.travollo.Travel.domains.comments.controller;

import com.travollo.Travel.common.PageResponse;
import com.travollo.Travel.domains.comments.dto.CommentFilterDTO;
import com.travollo.Travel.domains.comments.dto.CommentResponseDTO;
import com.travollo.Travel.domains.comments.dto.CreateCommentDTO;
import com.travollo.Travel.domains.comments.dto.UpdateCommentDTO;
import com.travollo.Travel.domains.user.entity.User;
import com.travollo.Travel.domains.comments.service.CommentSService;
import com.travollo.Travel.utils.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentSController {
    private final CommentSService commentSService;

    @GetMapping("")
    public ResponseEntity<PageResponse<CommentResponseDTO>> filterComment(
            @ModelAttribute CommentFilterDTO filterDTO
    ) {
        return ResponseEntity.ok(commentSService.getCommentsByFilter(filterDTO));
    }

    /** Post a new comment for a specific service */
    @PostMapping("/{serviceID}")
    public ResponseEntity<CommentResponseDTO> postComment(
            @PathVariable String serviceID,
            @ModelAttribute CreateCommentDTO comment,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok(commentSService.addComment(serviceID, comment, currentUser));
    }

    /** Retrieve all comments of a specific service with PAGINATION */
    @GetMapping("/{serviceID}")
    public ResponseEntity<PageResponse<CommentResponseDTO>> getCommentsByServiceID(
            @PathVariable String serviceID,
            @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(name = "size", required = false, defaultValue = "10") Integer size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction
    ) {
        CommentFilterDTO commentFilterDTO = CommentFilterDTO.builder()
                .serviceID(serviceID)
                .page(page)
                .size(size)
                .direction(direction)
                .sortBy(sortBy)
                .build();
        return ResponseEntity.ok(commentSService.getCommentsByFilter(commentFilterDTO));
    }

    @GetMapping("/{serviceID}/filter")
    public ResponseEntity<PageResponse<CommentResponseDTO>> filterComment(
            @PathVariable String serviceID,
            @ModelAttribute CommentFilterDTO filterDTO
    ) {
        filterDTO.setServiceID(serviceID);
        return ResponseEntity.status(HttpStatus.OK).body(commentSService.getCommentsByFilter(filterDTO));
    }

    /** Retrieve all comments of a specific service */
    @GetMapping("/{serviceID}/all")
    public ResponseEntity<List<CommentResponseDTO>> getAllComments(@PathVariable String serviceID) {
        return ResponseEntity.ok(commentSService.getAllCommentsByService(serviceID));
    }

    /** Update a specific comment */
    @PatchMapping("/{commentID}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable String commentID,
            @RequestBody UpdateCommentDTO updateCommentDTO,
            @CurrentUser User currentUser
            ) {
        return ResponseEntity.ok(commentSService.updateComment(commentID, updateCommentDTO, currentUser));
    }

    /* Delete a comment
    * Validate user permission to delete
    * */
    @DeleteMapping("/{commentID}")
    public ResponseEntity<String> deleteComment(
            @PathVariable String commentID,
            @CurrentUser User currenuser) {
        commentSService.deleteComment(commentID, currenuser);
        return ResponseEntity.ok("Delete successfully");
    }

    /* Like a specific comment
     * User token to identify the user
     *  */
    @PostMapping("/like/{commentID}")
    ResponseEntity<Object> likeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return  ResponseEntity.ok(commentSService.likeComment(currentUser, commentID));
    }

    /** Unlike a specific comment */
    @PostMapping("/unlike/{commentID}")
    ResponseEntity<Object> unlikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return ResponseEntity.ok( commentSService.unlikeComment(currentUser, commentID));
    }

    /** Dislike a specific comment */
    @PostMapping("/dislike/{commentID}")
    ResponseEntity<Object> dislikeComment(
            @PathVariable String commentID,
            @CurrentUser User currentUser
    ) {
        return  ResponseEntity.ok(commentSService.dislikeComment(currentUser, commentID));
    }
}
