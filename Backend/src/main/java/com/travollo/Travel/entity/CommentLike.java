package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="comment_service_like")
@Data
public class CommentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "comment_id")
    private CommentService comment;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
