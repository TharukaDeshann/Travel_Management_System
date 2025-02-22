package com.yamu.backend.config;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.core.credential.AzureKeyCredential;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "azure.openai")
@Getter
@Setter
@Slf4j
public class OpenAIConfig {
    private String endpoint;
    private String key;
    private String deploymentId;
    
    @Bean
    public OpenAIClient openAIClient() {
        log.info("Initializing OpenAI client with endpoint: {}", endpoint);
        return new OpenAIClientBuilder()
            .endpoint(endpoint)
            .credential(new AzureKeyCredential(key))
            .buildClient();
    }
}