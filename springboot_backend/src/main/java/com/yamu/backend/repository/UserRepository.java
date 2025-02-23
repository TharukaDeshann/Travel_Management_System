package com.yamu.backend.repository;

import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    List<User> findByRole(UserRole role);
}
