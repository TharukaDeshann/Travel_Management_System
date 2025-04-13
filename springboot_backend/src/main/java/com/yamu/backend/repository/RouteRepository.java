package com.yamu.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.yamu.backend.model.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
}
