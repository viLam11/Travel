package com.travollo.Travel.domains.comments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDTO {
    private String id;
    private String content;
    private Long rating;
    private int likes = 0;
    private int dislikes = 0;
    private LocalDateTime createdAt;

    private String userID;
    private String username;

    private String serviceID;
    private String serviceName;

    private List<String> imageList;
}
