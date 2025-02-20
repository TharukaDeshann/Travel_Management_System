package com.yamu.backend.config;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.core.credential.AzureKeyCredential;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {
    
    @Value("${azure.openai.key}")
    private String azureOpenAIKey;
    
    @Value("${azure.openai.endpoint}")
    private String azureOpenAIEndpoint;
    
    @Bean
    public OpenAIClient openAIClient() {
        return new OpenAIClientBuilder()
            .endpoint(azureOpenAIEndpoint)
            .credential(new AzureKeyCredential(azureOpenAIKey))
            .buildClient();
    }
}
