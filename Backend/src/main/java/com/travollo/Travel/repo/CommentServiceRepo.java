package com.travollo.Travel.repo;

import com.travollo.Travel.entity.CommentService;
import com.travollo.Travel.entity.TService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CommentServiceRepo extends JpaRepository<CommentService, Long> {
    Page<CommentService> findAllByTService(TService tService, Pageable pageable);
    int countByTService(TService service);
}
