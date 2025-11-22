package com.travollo.Travel.dto.comment;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class CreateCommentDTO {
    String content;
    Long rating;
    Long serviceID;
    List<MultipartFile> photos;
}
