package com.yamu.backend.model;

import com.yamu.backend.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED) // Table-per-subclass strategy
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "First Name is required")
    @Size(min = 3, max = 50, message = "First Name must be between 3 and 50 characters")
    private String firstName;

    @Column(nullable = true, length = 20)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Column(nullable = false, length = 255) // Store hashed password
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
   
    private String password;

    @Column(nullable = false, length = 20, name = "contact_number")
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10 to 15 digits")
    private String contactNumber;

    @Column(nullable = false, columnDefinition = "TEXT") // Allows long addresses
    @NotBlank(message = "Address is required")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, insertable = false)
    private UserRole role; // Role defined by specialization

    
}
