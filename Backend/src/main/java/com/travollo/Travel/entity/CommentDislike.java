package com.travollo.Travel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "comment_service_dislike")
@Data
public class CommentDislike {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "comment_id")
    private CommentService comment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
