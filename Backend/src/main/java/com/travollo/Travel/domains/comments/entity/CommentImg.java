package com.travollo.Travel.domains.comments.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_imgs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentImg {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String imageUrl;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;
}
