package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "comment_imgs")
@Data
public class CommentImg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private CommentService comment;
}
