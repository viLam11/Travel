package com.travollo.Travel.domains.comments.service;

import com.travollo.Travel.domains.comments.dto.UpdateCommentDTO;
import com.travollo.Travel.domains.comments.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CommentMapper {
    @Mapping(target = "imageList", ignore = true)
    void patchComment(UpdateCommentDTO updateCommentDTO, @MappingTarget Comment existingComment);
}