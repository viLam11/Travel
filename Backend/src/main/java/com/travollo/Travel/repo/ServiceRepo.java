package com.travollo.Travel.repo;

import com.travollo.Travel.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ServiceRepo extends JpaRepository<Service, Long> {

    @Query("SELECT DISTINCT s.serviceType FROM Service s")
    List<String> findDistinctServiceType();

    @Query("SELECT s FROM Service s")
    List<Service> find();

    Optional<Service> findByServiceID(Long serviceID);

    List<Service> findByServiceType(String serviceType);

    List<Service> findByServiceNameContainingIgnoreCase(String serviceName);


}
