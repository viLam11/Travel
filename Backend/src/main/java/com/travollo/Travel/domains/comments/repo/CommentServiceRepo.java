package com.travollo.Travel.domains.comments.repo;

import com.travollo.Travel.entity.Comment;
import com.travollo.Travel.entity.TService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CommentServiceRepo extends JpaRepository<Comment, String> {
    Page<Comment> findAllByTService(TService tService, Pageable pageable);

    @Query("SELECT c FROM Comment c WHERE c.tService.id = :serviceId")
    List<Comment> findAllByServiceId(@Param("serviceId") String serviceId);
}
