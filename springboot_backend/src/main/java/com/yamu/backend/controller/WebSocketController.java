package com.yamu.backend.controller;

import com.yamu.backend.dto.MessageDto;
import com.yamu.backend.dto.SendMessageDto;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
                             MessageService messageService,
                             UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat")
    public void handleMessage(SendMessageDto messageDto, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Unauthorized WebSocket message attempt");
            return;
        }
        
        String email = authentication.getName();
        Long senderId = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
        
        if (!userRepository.existsById(messageDto.getReceiverId())) {
            System.out.println("Invalid receiver ID: " + messageDto.getReceiverId());
            return;
        }

        MessageDto sentMessage = messageService.sendMessage(messageDto, senderId);

        // Send to sender's private queue
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                sentMessage);

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                messageDto.getReceiverId().toString(),
                "/queue/messages",
                sentMessage);
    }
}