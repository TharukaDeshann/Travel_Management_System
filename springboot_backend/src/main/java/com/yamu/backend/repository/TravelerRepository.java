package com.yamu.backend.repository;

import com.yamu.backend.model.Traveler;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelerRepository extends JpaRepository<Traveler, Long> {
}

