package com.yamu.model;

import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // e.g., "ROLE_USER"

    public User() {}

    public User(String username, String password, String role) {
        this.username = username;
        this.password = new BCryptPasswordEncoder().encode(password);
        this.role = role;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole() { return role; }

    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = new BCryptPasswordEncoder().encode(password); }
    public void setRole(String role) { this.role = role; }
}
