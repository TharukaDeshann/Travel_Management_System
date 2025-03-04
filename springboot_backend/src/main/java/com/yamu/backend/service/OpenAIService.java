package com.yamu.backend.service;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.models.*;
import com.yamu.backend.config.OpenAIConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import org.springframework.stereotype.Service;


import java.util.Arrays;


@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {
    private final OpenAIClient client;
    private final OpenAIConfig config;
    
    public String generateResponse(String prompt) {
        try {
            log.info("Generating response for prompt with deployment ID: {}", config.getDeploymentId());
            
            ChatCompletionsOptions options = new ChatCompletionsOptions(
                Arrays.asList(
                    new ChatMessage(ChatRole.SYSTEM, "You are a helpful assistant."),
                    new ChatMessage(ChatRole.USER, prompt)
                )
            );
            
            // Set additional parameters
            options.setMaxTokens(800);
            options.setTemperature(0.7);
            options.setModel(config.getDeploymentId());  // Using deploymentId as model name
            
            log.debug("Sending request to Azure OpenAI with options: {}", options);
            
            ChatCompletions completions = client.getChatCompletions(
                config.getDeploymentId(),
                options
            );
            
            return completions.getChoices().get(0).getMessage().getContent();
            
        } catch (Exception e) {
            log.error("Error generating response: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI response: " + e.getMessage(), e);
        }
    }
}
