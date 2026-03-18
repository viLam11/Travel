package com.travollo.Travel.domains.comments.entity;

import com.travollo.Travel.domains.user.entity.User;
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
    private Comment comment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
