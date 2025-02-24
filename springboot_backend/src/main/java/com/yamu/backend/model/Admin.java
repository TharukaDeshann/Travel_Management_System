package com.yamu.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
@DiscriminatorValue("ADMIN")
public class Admin extends User {
    // No additional attributes required
}
