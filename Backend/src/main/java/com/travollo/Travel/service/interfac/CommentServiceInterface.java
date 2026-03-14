package com.travollo.Travel.service.interfac;

import com.travollo.Travel.domains.comments.dto.CreateCommentDTO;
import com.travollo.Travel.domains.user.entity.User;
import org.springframework.http.ResponseEntity;

public interface CommentServiceInterface {
    ResponseEntity<Object> addComment(CreateCommentDTO commentDTO, User user);
}
