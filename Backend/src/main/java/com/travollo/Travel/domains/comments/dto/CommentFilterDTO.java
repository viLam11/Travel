package com.travollo.Travel.domains.comments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentFilterDTO {
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 10;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String direction = "desc";

    private String serviceID;
    private Long rating;
    private Boolean hasImages;
    private String keyword;
}
