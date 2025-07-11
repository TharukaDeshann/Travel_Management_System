package com.yamu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import io.github.cdimascio.dotenv.Dotenv; // Fixed typo in import

@SpringBootApplication
@EnableJpaRepositories("com.yamu.backend.repository")
@EntityScan("com.yamu.backend.model")
public class YamuApplication {

    public static void main(String[] args) {
        // Load environment variables from .env file BEFORE Spring starts
        Dotenv dotenv = Dotenv.load();
        
        // Set system properties based on .env values
        System.setProperty("MAIL_HOST", dotenv.get("MAIL_HOST"));
        System.setProperty("MAIL_PORT", dotenv.get("MAIL_PORT"));
        System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
        System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD"));
        
        // Now start Spring application
        ApplicationContext context = SpringApplication.run(YamuApplication.class, args);
    }
}