package com.travollo.Travel.repo;

import com.travollo.Travel.entity.CommentDislike;
import com.travollo.Travel.entity.CommentService;
import com.travollo.Travel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentSDislikeRepo extends JpaRepository<CommentDislike, String> {
    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END
            FROM CommentDislike c
            WHERE c.user =: user AND c.comment =: comment
    """)
    boolean existByUserAndComment(@Param("user")User user, @Param("comment")CommentService comment);


    Optional<CommentDislike> findByUserAndComment(User user, CommentService comment);
    long deleteByUserAndComment(User user, CommentService comment);

}
