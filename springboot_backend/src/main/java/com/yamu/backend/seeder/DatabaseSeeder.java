package com.yamu.backend.seeder;

import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Admin;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseSeeder {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedAdminUsers() {
        // 🔹 Define 5 unique admin accounts
        Map<String, String> adminAccounts = Map.of(
            "admin1@example.com", "Admin One",
            "admin2@example.com", "Admin Two",
            "admin3@example.com", "Admin Three",
            "admin4@example.com", "Admin Four",
            "admin5@example.com", "Admin Five"
        );

        List<User> existingAdmins = userRepository.findByRole(UserRole.ADMIN);

        for (Map.Entry<String, String> entry : adminAccounts.entrySet()) {
            String email = entry.getKey();
            String name = entry.getValue();

            // 🔹 Check if this specific admin already exists
            boolean exists = existingAdmins.stream().anyMatch(admin -> admin.getEmail().equals(email));

            if (!exists) {
                Admin admin = new Admin();
                admin.setFirstName(name.split(" ")[0]);
                admin.setLastName(name.split(" ")[1]);
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode("Admin@123")); // 🔒 Set a strong default password
                admin.setContactNumber("076234578");
                admin.setAddress("Admin Office");
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Created admin: " + email);
            } else {
                System.out.println("✅ Admin already exists: " + email);
            }
        }
    }
}
