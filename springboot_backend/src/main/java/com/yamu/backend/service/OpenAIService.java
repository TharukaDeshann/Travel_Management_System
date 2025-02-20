package com.yamu.backend.service;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAIService {

    @Autowired
    private OpenAIClient openAIClient;
    
    @Value("${azure.openai.model}")
    private String modelName;

    public String getTravelResponse(String userQuery) {
        List<ChatMessage> chatMessages = new ArrayList<>();
        chatMessages.add(new ChatMessage(ChatRole.USER, userQuery));

        ChatCompletions chatCompletions = openAIClient.getChatCompletions(
            modelName,
            new ChatCompletionsOptions(chatMessages)
        );

        return chatCompletions.getChoices().get(0).getMessage().getContent();
    }
}
