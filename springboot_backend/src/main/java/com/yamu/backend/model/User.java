package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "users") // Sets the database table name
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false, length = 10)
    @NotBlank(message = "Name is required")
    private String firstname;

    @Column( length = 10)
    private String lastname;

    @Column(nullable = false, length = 255) // Store hashed password
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", 
             message = "Password must contain at least one uppercase letter, one number, and one special character")
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10 to 15 digits")
    private String phonenumber;

    @Column(nullable = false, columnDefinition = "TEXT") // Allows long addresses
    @NotBlank(message = "Address is required")
    private String address;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstname; }
    public void setFirstName(String firstname) { this.firstname = firstname; }

    public String getLastName() { return lastname; }
    public void setLastName(String lastname) { this.lastname = lastname; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhonenumber() { return phonenumber; }
    public void setPhonenumber(String phonenumber) { this.phonenumber = phonenumber; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
