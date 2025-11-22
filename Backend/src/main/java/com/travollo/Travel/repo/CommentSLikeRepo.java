package com.travollo.Travel.repo;

import com.travollo.Travel.entity.CommentLike;
import com.travollo.Travel.entity.CommentService;
import com.travollo.Travel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentSLikeRepo extends JpaRepository<CommentLike, String> {
    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END 
            FROM CommentLike c 
            WHERE c.user =: user AND c.comment =: comment """)
    boolean existLike(@Param("user") User user, @Param("comment") CommentService comment);


    Optional<CommentLike> findByUserAndComment(User user, CommentService comment);
    long deleteByUserAndComment(User user, CommentService comment);
}
