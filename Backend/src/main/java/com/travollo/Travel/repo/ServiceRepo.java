package com.travollo.Travel.repo;

import com.travollo.Travel.entity.TService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ServiceRepo extends JpaRepository<TService, Long> {

}
