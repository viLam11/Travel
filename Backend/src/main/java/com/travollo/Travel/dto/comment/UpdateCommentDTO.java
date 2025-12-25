package com.travollo.Travel.dto.comment;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class UpdateCommentDTO {
    Long id;
    Long rating;
    String content;
    List<MultipartFile> photos;
}
