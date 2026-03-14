package com.travollo.Travel.domains.comments.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateCommentDTO {
    private String content;
    private Long rating;
    private LocalDateTime createdAt;
    private List<MultipartFile> imageList;
}
