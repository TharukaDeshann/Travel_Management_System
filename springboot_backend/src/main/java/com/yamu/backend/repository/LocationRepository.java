package com.yamu.backend.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.yamu.backend.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findById(long id);
}