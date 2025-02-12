package com.yamu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class YamuApplication {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(YamuApplication.class, args);
		Devoloper dev = context.getBean(Devoloper.class);
		dev.build();
	}

}
