package com.travollo.Travel.domains.comments.repo;

import com.travollo.Travel.domains.comments.entity.Comment;
import com.travollo.Travel.domains.travel.entity.TService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CommentServiceRepo extends JpaRepository<Comment, String>, Specification<Comment> {
    Page<Comment> findAllByTravelService(TService travelService, Pageable pageable);

    @Query("SELECT c FROM Comment c WHERE c.travelService.id = :serviceId")
    List<Comment> findAllByServiceId(@Param("serviceId") String serviceId);
}
