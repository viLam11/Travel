package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepo extends JpaRepository<Blog, Long> {
}
