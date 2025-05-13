package com.yamu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
// Import the required packages



@SpringBootApplication
@EnableJpaRepositories("com.yamu.backend.repository")
@EntityScan("com.yamu.backend.model") // Replace with your entity package
public class YamuApplication {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(YamuApplication.class, args);
		

		


	}
}
