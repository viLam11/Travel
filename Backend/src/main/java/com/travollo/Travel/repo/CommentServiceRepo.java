package com.travollo.Travel.repo;

import com.travollo.Travel.entity.CommentService;
import com.travollo.Travel.entity.TService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface CommentServiceRepo extends JpaRepository<CommentService, String> {
    Page<CommentService> findAllByTService(TService tService, Pageable pageable);

    @Query("SELECT COUNT(c) FROM CommentService c WHERE c.tService.id =: serviceID")
    int countByServiceID(String serviceID);
}
