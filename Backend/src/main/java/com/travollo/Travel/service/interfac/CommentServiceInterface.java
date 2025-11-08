package com.travollo.Travel.service.interfac;

import com.travollo.Travel.dto.comment.CreateCommentDTO;
import com.travollo.Travel.entity.User;
import org.springframework.http.ResponseEntity;

public interface CommentServiceInterface {
    ResponseEntity<Object> addComment(CreateCommentDTO commentDTO, User user);
}
